import { NextResponse } from "next/server";
import { db } from "@/db";
import { couponRedemptions, coupons, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Введите промокод" }, { status: 400 });

  const rows = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  const coupon = rows[0];
  if (!coupon) return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
  if (coupon.usedActivations >= coupon.maxActivations) {
    return NextResponse.json({ error: "Активации промокода закончились" }, { status: 400 });
  }

  const used = await db
    .select()
    .from(couponRedemptions)
    .where(and(eq(couponRedemptions.couponId, coupon.id), eq(couponRedemptions.userId, user.id)))
    .limit(1);
  if (used[0]) return NextResponse.json({ error: "Вы уже активировали этот промокод" }, { status: 400 });

  await db.insert(couponRedemptions).values({ couponId: coupon.id, userId: user.id });
  await db
    .update(coupons)
    .set({ usedActivations: sql`${coupons.usedActivations} + 1` })
    .where(eq(coupons.id, coupon.id));
  await db
    .update(users)
    .set({ balance: sql`${users.balance} + ${Number(coupon.amount)}` })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true, amount: Number(coupon.amount) });
}
