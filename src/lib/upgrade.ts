import { db } from "@/db";
import { inventory, skins, upgrades, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export function landingFor(win: boolean, chancePercent: number) {
  const c = Math.min(99, Math.max(0.5, chancePercent)) / 100;
  if (win) {
    return Math.random() * (c * 0.94) + c * 0.03;
  }
  const rest = 1 - c;
  return c + 0.02 * rest + Math.random() * rest * 0.94;
}

export async function resolveUpgrade(upgradeId: number, win: boolean) {
  const rows = await db.select().from(upgrades).where(eq(upgrades.id, upgradeId)).limit(1);
  const up = rows[0];
  if (!up || up.status === "resolved") return up ?? null;

  const stake = Number(up.betAmount) + (await stakeSkinValue(up.betSkinId));
  let payout = 0;

  if (win) {
    if (up.targetSkinId) {
      await db.insert(inventory).values({ userId: up.userId, skinId: up.targetSkinId, status: "owned" });
      const target = await db.select().from(skins).where(eq(skins.id, up.targetSkinId)).limit(1);
      payout = Number(target[0]?.price ?? 0);
    } else {
      payout = Math.round(stake * Number(up.multiplier) * 100) / 100;
      await db
        .update(users)
        .set({ balance: sql`${users.balance} + ${payout}` })
        .where(eq(users.id, up.userId));
    }
  }

  if (up.betInventoryId) {
    await db.update(inventory).set({ status: "lost" }).where(eq(inventory.id, up.betInventoryId));
  }

  const landing = landingFor(win, Number(up.chance));

  const updated = await db
    .update(upgrades)
    .set({ status: "resolved", win, payout, landing })
    .where(eq(upgrades.id, upgradeId))
    .returning();

  return updated[0];
}

async function stakeSkinValue(skinId: number | null) {
  if (!skinId) return 0;
  const rows = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);
  return Number(rows[0]?.price ?? 0);
}
