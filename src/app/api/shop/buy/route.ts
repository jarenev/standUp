import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, skins, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const skinId = Number(body?.skinId);
  const rows = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);
  const skin = rows[0];
  if (!skin) return NextResponse.json({ error: "Скин не найден" }, { status: 404 });

  const price = Number(skin.price);
  if (user.balance < price) return NextResponse.json({ error: "Недостаточно голды" }, { status: 400 });

  await db
    .update(users)
    .set({ balance: sql`${users.balance} - ${price}` })
    .where(eq(users.id, user.id));
  await db.insert(inventory).values({ userId: user.id, skinId: skin.id, status: "owned" });

  return NextResponse.json({ ok: true });
}
