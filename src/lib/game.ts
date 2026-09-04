import { db } from "@/db";
import { settings, skins } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { SEED_SKINS, slugify } from "./skins-data";

export const MIN_DEPOSIT = 50;
export const WITHDRAW_COMMISSION = 0.2; // 20%
export const TRADE_SKIN = 'M4 "FLOCK"';
export const HOUSE_EDGE = 0.95; // 5% преимущество площадки
export const SELL_RATE = 0.9; // продажа предмета: 90% от рыночной цены

export function multiplierFromChance(chancePercent: number) {
  const c = Math.min(90, Math.max(1, chancePercent));
  return Math.round(((HOUSE_EDGE * 100) / c) * 100) / 100;
}

export function chanceFromMultiplier(multiplier: number) {
  const m = Math.min(100, Math.max(1.05, multiplier));
  return Math.round(((HOUSE_EDGE * 100) / m) * 100) / 100;
}

export function listAmountFor(net: number) {
  return Math.round((net / (1 - WITHDRAW_COMMISSION)) * 100) / 100;
}

export async function getSetting(key: string, fallback: string) {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function isRigEnabled() {
  return (await getSetting("rig_mode", "off")) === "on";
}

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(skins);
  const count = Number(rows[0]?.count ?? 0);
  if (count === 0) {
    await db
      .insert(skins)
      .values(
        SEED_SKINS.map((s) => ({
          name: s.name,
          weapon: s.weapon,
          rarity: s.rarity,
          price: s.price,
          slug: slugify(s.weapon, s.name),
        })),
      )
      .onConflictDoNothing();
  }
  seeded = true;
}
