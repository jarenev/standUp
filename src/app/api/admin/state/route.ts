import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, inventory, skins, upgrades, users, withdrawals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { defaultAvatar, getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const rig = (await getSetting("rig_mode", "off")) === "on";

  const pending = await db
    .select({
      id: upgrades.id,
      login: users.login,
      avatarUrl: users.avatarUrl,
      betAmount: upgrades.betAmount,
      multiplier: upgrades.multiplier,
      chance: upgrades.chance,
      speed: upgrades.speed,
      status: upgrades.status,
      betSkinId: upgrades.betSkinId,
      targetSkinId: upgrades.targetSkinId,
      createdAt: upgrades.createdAt,
    })
    .from(upgrades)
    .innerJoin(users, eq(upgrades.userId, users.id))
    .where(eq(upgrades.status, "pending_admin"))
    .orderBy(desc(upgrades.id))
    .limit(50);

  const allSkins = await db.select().from(skins);
  const skinMap = new Map(allSkins.map((s) => [s.id, s]));

  const pendingUpgrades = pending.map((p) => {
    const betSkin = p.betSkinId ? skinMap.get(p.betSkinId) : null;
    const target = p.targetSkinId ? skinMap.get(p.targetSkinId) : null;
    const skinValue = betSkin ? Number(betSkin.price) : 0;
    return {
      id: p.id,
      login: p.login,
      avatarUrl: p.avatarUrl || defaultAvatar(p.login),
      betAmount: Number(p.betAmount),
      skinValue,
      stake: Math.round((Number(p.betAmount) + skinValue) * 100) / 100,
      betSkin: betSkin ? `${betSkin.weapon} "${betSkin.name}"` : null,
      target: target ? `${target.weapon} "${target.name}"` : null,
      multiplier: Number(p.multiplier),
      chance: Number(p.chance),
      speed: p.speed,
      potential: Math.round((Number(p.betAmount) + skinValue) * Number(p.multiplier) * 100) / 100,
      createdAt: p.createdAt,
    };
  });

  const wds = await db
    .select({
      id: withdrawals.id,
      login: users.login,
      avatarUrl: users.avatarUrl,
      skinName: withdrawals.skinName,
      netAmount: withdrawals.netAmount,
      listAmount: withdrawals.listAmount,
      tradeSkin: withdrawals.tradeSkin,
      status: withdrawals.status,
      createdAt: withdrawals.createdAt,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.id))
    .limit(60);

  const couponRows = await db.select().from(coupons).orderBy(desc(coupons.id)).limit(60);

  const userRows = await db
    .select({
      id: users.id,
      login: users.login,
      balance: users.balance,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.id))
    .limit(100);

  const invCount = await db.select({ id: inventory.id }).from(inventory);

  return NextResponse.json({
    rig,
    pendingUpgrades,
    withdrawals: wds.map((w) => ({
      ...w,
      avatarUrl: w.avatarUrl || defaultAvatar(w.login),
      netAmount: Number(w.netAmount),
      listAmount: Number(w.listAmount),
    })),
    coupons: couponRows.map((c) => ({ ...c, amount: Number(c.amount) })),
    users: userRows.map((u) => ({
      ...u,
      balance: Number(u.balance),
      avatarUrl: u.avatarUrl || defaultAvatar(u.login),
    })),
    stats: { items: invCount.length, players: userRows.length },
  });
}
