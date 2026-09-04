import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_LOGIN, defaultAvatar, hashPassword, setSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await req.json().catch(() => null);
  const login = String(body?.login ?? "").trim();
  const password = String(body?.password ?? "");
  if (login.length < 3) return NextResponse.json({ error: "Логин минимум 3 символа" }, { status: 400 });
  if (password.length < 4) return NextResponse.json({ error: "Пароль минимум 4 символа" }, { status: 400 });

  const isAdminLogin = login.toUpperCase() === ADMIN_LOGIN;
  if (isAdminLogin && (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)) {
    return NextResponse.json({ error: "Регистрация этого логина закрыта" }, { status: 403 });
  }

  const existing = await db.select().from(users).where(eq(users.login, login)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "Такой логин уже занят" }, { status: 400 });

  const created = await db
    .insert(users)
    .values({
      login,
      passwordHash: hashPassword(password),
      avatarUrl: defaultAvatar(login),
      isAdmin: isAdminLogin,
      balance: 0,
    })
    .returning();

  await setSession(created[0].id);
  return NextResponse.json({ ok: true, isAdmin: created[0].isAdmin });
}
