import { NextResponse } from "next/server";
import { db } from "@/db";
import { deposits } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const rows = await db.select().from(deposits).where(eq(deposits.code, code)).limit(1);
  const dep = rows[0];
  if (!dep) return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  return NextResponse.json({
    deposit: { code: dep.code, amount: Number(dep.amount), status: dep.status },
  });
}
