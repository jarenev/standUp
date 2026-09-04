import { NextResponse } from "next/server";
import { db } from "@/db";
import { upgrades } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const { id } = await ctx.params;

  const rows = await db
    .select()
    .from(upgrades)
    .where(and(eq(upgrades.id, Number(id)), eq(upgrades.userId, user.id)))
    .limit(1);
  const up = rows[0];
  if (!up) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json({
    id: up.id,
    status: up.status,
    chance: Number(up.chance),
    multiplier: Number(up.multiplier),
    speed: up.speed,
    win: up.win,
    landing: up.landing === null ? null : Number(up.landing),
    payout: Number(up.payout),
  });
}
