import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await req.json().catch(() => null);
  const login = String(body?.login ?? "").trim();
  const password = String(body?.password ?? "");

  const rows = await db.select().from(users).where(eq(users.login, login)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 400 });
  }
  if (user.isBanned) return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });

  await setSession(user.id);
  return NextResponse.json({ ok: true, isAdmin: user.isAdmin });
}
