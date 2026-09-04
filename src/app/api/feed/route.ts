import { NextResponse } from "next/server";
import { db } from "@/db";
import { skins, upgrades, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { defaultAvatar } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: upgrades.id,
      login: users.login,
      avatarUrl: users.avatarUrl,
      multiplier: upgrades.multiplier,
      win: upgrades.win,
      betAmount: upgrades.betAmount,
      payout: upgrades.payout,
      status: upgrades.status,
      targetName: skins.name,
      targetWeapon: skins.weapon,
      targetRarity: skins.rarity,
    })
    .from(upgrades)
    .innerJoin(users, eq(upgrades.userId, users.id))
    .leftJoin(skins, eq(upgrades.targetSkinId, skins.id))
    .where(eq(upgrades.status, "resolved"))
    .orderBy(desc(upgrades.id))
    .limit(14);

  return NextResponse.json({
    feed: rows.map((r) => ({
      id: r.id,
      login: r.login,
      avatarUrl: r.avatarUrl || defaultAvatar(r.login),
      multiplier: Number(r.multiplier),
      win: Boolean(r.win),
      payout: Number(r.payout),
      bet: Number(r.betAmount),
      target: r.targetName ? `${r.targetWeapon} «${r.targetName}»` : null,
      rarity: r.targetRarity ?? "common",
    })),
  });
}
