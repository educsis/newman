import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  findUserByUsername,
  getSession,
  hashPassword,
  invalidateSession,
} from "./db";

const SESSION_COOKIE = "newman_session";

export async function getCurrentSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSession(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;
  return { id: session.user_id, username: session.username };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function signIn(username, password) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  const candidateHash = hashPassword(password);
  if (candidateHash !== user.password_hash) {
    return null;
  }
  const { token, expiresAt } = await createSession(user.id);
  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(expiresAt),
  });
  return { id: user.id, username: user.username };
}

export async function signOut() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await invalidateSession(token);
  cookieStore.delete(SESSION_COOKIE);
}
