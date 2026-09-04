import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, skins, upgrades, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { chanceFromMultiplier, isRigEnabled, multiplierFromChance } from "@/lib/game";
import { resolveUpgrade } from "@/lib/upgrade";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const betAmount = Math.round(Math.max(0, Number(body?.betAmount ?? 0)) * 100) / 100;
  const inventoryId = body?.inventoryId ? Number(body.inventoryId) : null;
  const targetSkinId = body?.targetSkinId ? Number(body.targetSkinId) : null;
  const speed = body?.speed === "slow" ? "slow" : "fast";
  const requestedChance = Number(body?.chance ?? 50);

  if (betAmount > user.balance) return NextResponse.json({ error: "Недостаточно голды" }, { status: 400 });

  let betSkinId: number | null = null;
  let skinValue = 0;
  if (inventoryId) {
    const rows = await db
      .select({ id: inventory.id, status: inventory.status, skinId: skins.id, price: skins.price })
      .from(inventory)
      .innerJoin(skins, eq(inventory.skinId, skins.id))
      .where(and(eq(inventory.id, inventoryId), eq(inventory.userId, user.id)))
      .limit(1);
    const item = rows[0];
    if (!item || item.status !== "owned") {
      return NextResponse.json({ error: "Скин недоступен" }, { status: 400 });
    }
    betSkinId = item.skinId;
    skinValue = Number(item.price);
  }

  const stake = Math.round((betAmount + skinValue) * 100) / 100;
  if (stake <= 0) return NextResponse.json({ error: "Укажите ставку" }, { status: 400 });

  let multiplier: number;
  let chance: number;

  if (targetSkinId) {
    const rows = await db.select().from(skins).where(eq(skins.id, targetSkinId)).limit(1);
    const target = rows[0];
    if (!target) return NextResponse.json({ error: "Целевой скин не найден" }, { status: 404 });
    multiplier = Math.round((Number(target.price) / stake) * 100) / 100;
    if (multiplier < 1.06) {
      return NextResponse.json({ error: "Целевой скин слишком дешёвый для этой ставки" }, { status: 400 });
    }
    chance = chanceFromMultiplier(multiplier);
    if (chance < 1) return NextResponse.json({ error: "Шанс слишком мал, уменьшите цель" }, { status: 400 });
  } else {
    chance = Math.min(90, Math.max(1, Math.round(requestedChance * 100) / 100));
    multiplier = multiplierFromChance(chance);
  }

  // списываем ставку
  if (betAmount > 0) {
    await db
      .update(users)
      .set({ balance: sql`${users.balance} - ${betAmount}` })
      .where(eq(users.id, user.id));
  }
  if (inventoryId) {
    await db.update(inventory).set({ status: "in_upgrade" }).where(eq(inventory.id, inventoryId));
  }

  const rig = await isRigEnabled();

  const created = await db
    .insert(upgrades)
    .values({
      userId: user.id,
      betAmount,
      betSkinId,
      betInventoryId: inventoryId,
      targetSkinId,
      multiplier,
      chance,
      speed,
      status: rig ? "pending_admin" : "resolved",
    })
    .returning();

  const up = created[0];

  if (rig) {
    return NextResponse.json({
      id: up.id,
      status: "pending_admin",
      chance,
      multiplier,
      speed,
      stake,
    });
  }

  const win = Math.random() * 100 < chance;
  const resolved = await resolveUpgrade(up.id, win);

  return NextResponse.json({
    id: up.id,
    status: "resolved",
    chance,
    multiplier,
    speed,
    stake,
    win: resolved?.win ?? false,
    landing: Number(resolved?.landing ?? 0.9),
    payout: Number(resolved?.payout ?? 0),
  });
}
