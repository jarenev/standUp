import { NextResponse } from "next/server";
import { db } from "@/db";
import { deposits, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const rows = await db.select().from(deposits).where(eq(deposits.code, code)).limit(1);
  const dep = rows[0];
  if (!dep) return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });

  if (dep.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true, amount: Number(dep.amount) });
  }

  await db.update(deposits).set({ status: "paid", paidAt: new Date() }).where(eq(deposits.id, dep.id));
  await db
    .update(users)
    .set({ balance: sql`${users.balance} + ${Number(dep.amount)}` })
    .where(eq(users.id, dep.userId));

  return NextResponse.json({ ok: true, amount: Number(dep.amount) });
}
