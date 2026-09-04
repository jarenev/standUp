import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, skins, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { SELL_RATE } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const itemId = Number(body?.inventoryId);

  const rows = await db
    .select({ id: inventory.id, status: inventory.status, price: skins.price })
    .from(inventory)
    .innerJoin(skins, eq(inventory.skinId, skins.id))
    .where(and(eq(inventory.id, itemId), eq(inventory.userId, user.id)))
    .limit(1);

  const item = rows[0];
  if (!item || item.status !== "owned") {
    return NextResponse.json({ error: "Предмет недоступен для продажи" }, { status: 400 });
  }

  const payout = Math.round(Number(item.price) * SELL_RATE * 100) / 100;
  await db.update(inventory).set({ status: "sold" }).where(eq(inventory.id, item.id));
  await db
    .update(users)
    .set({ balance: sql`${users.balance} + ${payout}` })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true, payout });
}
