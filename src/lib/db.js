import { createHash, randomBytes } from "crypto";
import mysql from "mysql2/promise";

const DEFAULT_DB_CONFIG = {
  host:
    process.env.MYSQL_HOST ??
    process.env.DB_HOST ??
    "newman-do-user-27694479-0.d.db.ondigitalocean.com",
  port: Number.parseInt(
    process.env.MYSQL_PORT ?? process.env.DB_PORT ?? "25060",
    10
  ),
  user:
    process.env.MYSQL_USER ??
    process.env.MYSQL_USERNAME ??
    process.env.DB_USER ??
    "doadmin",
  password:
    process.env.MYSQL_PASSWORD ??
    process.env.DB_PASSWORD,
  database:
    process.env.MYSQL_DATABASE ??
    process.env.DB_DATABASE ??
    "defaultdb",
};

function buildSslConfig() {
  const mode = (process.env.MYSQL_SSL_MODE ?? "REQUIRED").toUpperCase();
  if (mode === "DISABLED") {
    return undefined;
  }

  const rawCa =
    process.env.MYSQL_SSL_CA ??
    process.env.DB_SSL_CA ??
    null;
  const ca =
    rawCa && rawCa.includes("\\n")
      ? rawCa.replace(/\\n/g, "\n")
      : rawCa ?? undefined;

  const rejectUnauthorizedEnv = process.env.MYSQL_SSL_REJECT_UNAUTHORIZED;
  let rejectUnauthorized;
  if (rejectUnauthorizedEnv !== undefined) {
    rejectUnauthorized = rejectUnauthorizedEnv.toLowerCase() !== "false";
  } else if (mode === "VERIFY_CA" || mode === "VERIFY_IDENTITY") {
    rejectUnauthorized = true;
  } else {
    // REQUIRED / PREFERRED mean "encrypt connection" even with self-signed certs.
    rejectUnauthorized = false;
  }

  if (!ca) {
    return { rejectUnauthorized };
  }

  return { rejectUnauthorized, ca };
}

function createPool() {
  const ssl = buildSslConfig();
  const connectionLimit = Number.parseInt(
    process.env.MYSQL_CONNECTION_LIMIT ?? "10",
    10
  );

  return mysql.createPool({
    host: DEFAULT_DB_CONFIG.host,
    port: DEFAULT_DB_CONFIG.port,
    user: DEFAULT_DB_CONFIG.user,
    password: DEFAULT_DB_CONFIG.password,
    database: DEFAULT_DB_CONFIG.database,
    ssl,
    waitForConnections: true,
    connectionLimit: Number.isNaN(connectionLimit) ? 10 : connectionLimit,
    queueLimit: 0,
  });
}

const globalForDb = globalThis;

const pool =
  globalForDb.__newmanMysqlPool ?? (globalForDb.__newmanMysqlPool = createPool());

async function ensureInitialized() {
  if (globalForDb.__newmanMysqlInitPromise) {
    return globalForDb.__newmanMysqlInitPromise;
  }

  globalForDb.__newmanMysqlInitPromise = (async () => {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(191) NOT NULL UNIQUE,
          password_hash CHAR(64) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          token CHAR(96) PRIMARY KEY,
          user_id INT NOT NULL,
          expires_at BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          image_path TEXT,
          content MEDIUMTEXT NOT NULL,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          INDEX idx_posts_slug (slug)
        ) ENGINE=InnoDB;
      `);

      const adminPasswordHash = hashPassword("admin");
      await connection.execute(
        `
          INSERT INTO users (username, password_hash)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE username = VALUES(username)
        `,
        ["admin", adminPasswordHash]
      );
    } finally {
      connection.release();
    }
  })().catch((error) => {
    delete globalForDb.__newmanMysqlInitPromise;
    throw error;
  });

  return globalForDb.__newmanMysqlInitPromise;
}

async function query(sql, params = []) {
  await ensureInitialized();
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  await ensureInitialized();
  const [result] = await pool.execute(sql, params);
  return result;
}

export function hashPassword(rawPassword) {
  return createHash("sha256").update(rawPassword).digest("hex");
}

export async function createSession(userId, ttlMinutes = 60 * 12) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  await execute(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expiresAt]
  );
  return { token, expiresAt };
}

export async function getSession(token) {
  if (!token) return null;
  const rows = await query(
    `SELECT
       sessions.token,
       sessions.expires_at AS expiresAt,
       users.id AS user_id,
       users.username
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ?
     LIMIT 1`,
    [token]
  );
  const session = rows[0];
  if (!session) {
    return null;
  }
  if (session.expiresAt < Date.now()) {
    await execute("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  return session;
}

export async function invalidateSession(token) {
  if (!token) return;
  await execute("DELETE FROM sessions WHERE token = ?", [token]);
}

export async function findUserByUsername(username) {
  const rows = await query(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] ?? null;
}

export async function listPosts() {
  return query(
    `SELECT
       id,
       title,
       slug,
       image_path AS imagePath,
       content,
       created_at AS createdAt,
       updated_at AS updatedAt
     FROM posts
     ORDER BY created_at DESC`
  );
}

export async function getPostBySlug(slug) {
  const rows = await query(
    `SELECT
       id,
       title,
       slug,
       image_path AS imagePath,
       content,
       created_at AS createdAt,
       updated_at AS updatedAt
     FROM posts
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getPostById(id) {
  const rows = await query(
    `SELECT
       id,
       title,
       slug,
       image_path AS imagePath,
       content,
       created_at AS createdAt,
       updated_at AS updatedAt
     FROM posts
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function savePost({ id, title, slug, imagePath, content }) {
  const now = Date.now();
  if (id) {
    await execute(
      `UPDATE posts
       SET title = ?,
           slug = ?,
           image_path = ?,
           content = ?,
           updated_at = ?
       WHERE id = ?`,
      [title, slug, imagePath ?? null, content, now, id]
    );
    return getPostById(id);
  }

  const result = await execute(
    `INSERT INTO posts (title, slug, image_path, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, slug, imagePath ?? null, content, now, now]
  );
  const insertedId = result.insertId;
  return getPostById(insertedId);
}

export async function deletePost(id) {
  await execute("DELETE FROM posts WHERE id = ?", [id]);
}

export async function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) {
    return `post-${Date.now()}`;
  }

  let candidate = base;
  let suffix = 1;
  while (await slugExists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function slugExists(slug) {
  const rows = await query(
    "SELECT 1 FROM posts WHERE slug = ? LIMIT 1",
    [slug]
  );
  return rows.length > 0;
}

export default pool;
