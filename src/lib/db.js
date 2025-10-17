import fs from "fs";
import path from "path";
import { createHash, randomBytes } from "crypto";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "var");
const dbPath = path.join(dataDir, "newman.db");
const initMarkerPath = path.join(dataDir, ".initialized");
const initLockPath = path.join(dataDir, ".init-lock");

function sleep(ms) {
  const arr = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(arr, 0, 0, ms);
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function obtainInitLock() {
  while (true) {
    try {
      const fd = fs.openSync(initLockPath, "wx");
      return fd;
    } catch (error) {
      if (error.code === "EEXIST") {
        sleep(25);
        continue;
      }
      throw error;
    }
  }
}

function initializeDatabase() {
  const instance = new Database(dbPath, { 
    timeout: 10000,
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });
  
  // Configure SQLite for better concurrency
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  instance.pragma("synchronous = NORMAL");
  instance.pragma("busy_timeout = 30000");
  instance.pragma("wal_autocheckpoint = 1000");

  if (!fs.existsSync(initMarkerPath)) {
    const lockFd = obtainInitLock();
    try {
      if (!fs.existsSync(initMarkerPath)) {
        instance.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL
          );

          CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            image_path TEXT,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        const passwordHash = createHash("sha256").update("admin").digest("hex");
        instance
          .prepare(
            "INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)"
          )
          .run("admin", passwordHash);

        fs.writeFileSync(initMarkerPath, new Date().toISOString(), "utf8");
      }
    } finally {
      try {
        fs.closeSync(lockFd);
      } catch {
        // ignore
      }
      try {
        fs.unlinkSync(initLockPath);
      } catch {
        // ignore
      }
    }
  }

  return instance;
}

function withRetry(fn, attempts = 10, baseDelay = 50) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return fn();
    } catch (error) {
      if (error && (error.code === "SQLITE_BUSY" || error.code === "SQLITE_LOCKED") && attempt < attempts) {
        lastError = error;
        const jitteredDelay = baseDelay * attempt + Math.random() * baseDelay;
        sleep(Math.min(jitteredDelay, 2000)); // Cap at 2 seconds
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

const globalForDb = globalThis;
const db =
  globalForDb.__newmanDbInstance ?? (globalForDb.__newmanDbInstance = initializeDatabase());

export function hashPassword(rawPassword) {
  return createHash("sha256").update(rawPassword).digest("hex");
}

export function createSession(userId, ttlMinutes = 60 * 12) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  withRetry(() =>
    db
      .prepare(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (@token, @user_id, @expires_at)"
      )
      .run({ token, user_id: userId, expires_at: expiresAt })
  );
  return { token, expiresAt };
}

export function getSession(token) {
  if (!token) return null;
  const row = withRetry(() =>
    db
      .prepare(
        "SELECT sessions.token, sessions.expires_at, users.id AS user_id, users.username FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?"
      )
      .get(token)
  );
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    withRetry(() =>
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token)
    );
    return null;
  }
  return row;
}

export function invalidateSession(token) {
  if (!token) return;
  withRetry(() => db.prepare("DELETE FROM sessions WHERE token = ?").run(token));
}

export function findUserByUsername(username) {
  return withRetry(() =>
    db
      .prepare(
        "SELECT id, username, password_hash FROM users WHERE username = ?"
      )
      .get(username)
  );
}

export function listPosts() {
  return withRetry(() =>
    db
      .prepare(
        "SELECT id, title, slug, image_path AS imagePath, content, created_at AS createdAt, updated_at AS updatedAt FROM posts ORDER BY created_at DESC"
      )
      .all()
  );
}

export function getPostBySlug(slug) {
  return withRetry(() =>
    db
      .prepare(
        "SELECT id, title, slug, image_path AS imagePath, content, created_at AS createdAt, updated_at AS updatedAt FROM posts WHERE slug = ?"
      )
      .get(slug)
  );
}

export function getPostById(id) {
  return withRetry(() =>
    db
      .prepare(
        "SELECT id, title, slug, image_path AS imagePath, content, created_at AS createdAt, updated_at AS updatedAt FROM posts WHERE id = ?"
      )
      .get(id)
  );
}

export function savePost({ id, title, slug, imagePath, content }) {
  const now = Date.now();
  if (id) {
    withRetry(() =>
      db
        .prepare(
          `UPDATE posts
           SET title = @title,
               slug = @slug,
               image_path = @imagePath,
               content = @content,
               updated_at = @updatedAt
           WHERE id = @id`
        )
        .run({
          id,
          title,
          slug,
          imagePath,
          content,
          updatedAt: now,
        })
    );
    return getPostById(id);
  }
  const result = withRetry(() =>
    db
      .prepare(
        `INSERT INTO posts (title, slug, image_path, content, created_at, updated_at)
         VALUES (@title, @slug, @imagePath, @content, @createdAt, @updatedAt)`
      )
      .run({
        title,
        slug,
        imagePath,
        content,
        createdAt: now,
        updatedAt: now,
      })
  );
  return getPostById(result.lastInsertRowid);
}

export function deletePost(id) {
  withRetry(() => db.prepare("DELETE FROM posts WHERE id = ?").run(id));
}

export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) return `post-${Date.now()}`;
  let candidate = base;
  let suffix = 1;
  while (
    withRetry(() =>
      db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(candidate)
    )
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

export default db;
