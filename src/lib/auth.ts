import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET ?? "standup-dev-secret-change-me";
const COOKIE = "standup_session";

export const ADMIN_LOGIN = "JARENEV";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 32);
  const original = Buffer.from(hash, "hex");
  if (candidate.length !== original.length) return false;
  return timingSafeEqual(candidate, original);
}

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

export async function setSession(userId: number) {
  const token = `${userId}.${sign(String(userId))}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  if (sign(id) !== sig) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

export type SessionUser = {
  id: number;
  login: string;
  avatarUrl: string;
  balance: number;
  isAdmin: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const u = rows[0];
  if (!u) return null;
  return {
    id: u.id,
    login: u.login,
    avatarUrl: u.avatarUrl || defaultAvatar(u.login),
    balance: Number(u.balance),
    isAdmin: u.isAdmin || u.login.toUpperCase() === ADMIN_LOGIN,
  };
}

export function defaultAvatar(login: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/png?size=256&seed=${encodeURIComponent(login)}`;
}
