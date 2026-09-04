import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, skins, withdrawals } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { TRADE_SKIN, listAmountFor } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const rows = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, user.id))
    .orderBy(desc(withdrawals.id));
  return NextResponse.json({
    withdrawals: rows.map((w) => ({
      ...w,
      netAmount: Number(w.netAmount),
      listAmount: Number(w.listAmount),
      pattern: w.pattern,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const itemId = Number(body?.inventoryId);
  const pattern = String(body?.pattern ?? "").trim();

  if (!pattern) {
    return NextResponse.json({ error: "Укажите паттерн скина" }, { status: 400 });
  }
  if (pattern.length > 100) {
    return NextResponse.json({ error: "Паттерн слишком длинный" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: inventory.id,
      status: inventory.status,
      price: skins.price,
      name: skins.name,
      weapon: skins.weapon,
    })
    .from(inventory)
    .innerJoin(skins, eq(inventory.skinId, skins.id))
    .where(and(eq(inventory.id, itemId), eq(inventory.userId, user.id)))
    .limit(1);

  const item = rows[0];
  if (!item || item.status !== "owned") {
    return NextResponse.json({ error: "Предмет недоступен для вывода" }, { status: 400 });
  }

  const net = Number(item.price);
  const list = listAmountFor(net);

  await db.update(inventory).set({ status: "withdraw_pending" }).where(eq(inventory.id, item.id));
  const created = await db
    .insert(withdrawals)
    .values({
      userId: user.id,
      inventoryId: item.id,
      skinName: `${item.weapon} "${item.name}"`,
      netAmount: net,
      listAmount: list,
      tradeSkin: TRADE_SKIN,
      pattern,
    })
    .returning();

  return NextResponse.json({ ok: true, withdrawal: { ...created[0], netAmount: net, listAmount: list } });
}
