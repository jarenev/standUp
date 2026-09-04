import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const avatarUrl = String(body?.avatarUrl ?? "").trim();
  if (!/^https?:\/\//.test(avatarUrl)) {
    return NextResponse.json({ error: "Ссылка на аватар должна начинаться с http" }, { status: 400 });
  }
  await db.update(users).set({ avatarUrl }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
