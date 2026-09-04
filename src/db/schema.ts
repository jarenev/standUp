import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url").notNull().default(""),
  balance: doublePrecision("balance").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skins = pgTable("skins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  weapon: text("weapon").notNull(),
  rarity: text("rarity").notNull(), // common | uncommon | rare | epic | legendary | arcane | nameless
  price: doublePrecision("price").notNull(),
  slug: text("slug").notNull().unique(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skinId: integer("skin_id").notNull(),
  status: text("status").notNull().default("owned"), // owned | in_upgrade | withdraw_pending | withdrawn | sold | lost
  acquiredAt: timestamp("acquired_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  inventoryId: integer("inventory_id"),
  skinName: text("skin_name").notNull(),
  netAmount: doublePrecision("net_amount").notNull(), // сколько получает игрок
  listAmount: doublePrecision("list_amount").notNull(), // сколько выставить с учётом 20% комиссии
  tradeSkin: text("trade_skin").notNull().default('M4 "FLOCK"'),
  status: text("status").notNull().default("pending"), // pending | done | declined
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const upgrades = pgTable("upgrades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  betAmount: doublePrecision("bet_amount").notNull(),
  betSkinId: integer("bet_skin_id"),
  betInventoryId: integer("bet_inventory_id"),
  targetSkinId: integer("target_skin_id"),
  multiplier: doublePrecision("multiplier").notNull(),
  chance: doublePrecision("chance").notNull(),
  speed: text("speed").notNull().default("fast"),
  status: text("status").notNull().default("resolved"), // pending_admin | resolved | declined
  win: boolean("win"),
  landing: doublePrecision("landing"), // 0..1 позиция остановки стрелки
  payout: doublePrecision("payout").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  maxActivations: integer("max_activations").notNull().default(1),
  usedActivations: integer("used_activations").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey(),
    couponId: integer("coupon_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("coupon_user_uniq").on(t.couponId, t.userId),
  }),
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
