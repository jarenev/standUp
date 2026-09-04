import { NextResponse } from "next/server";
import { db } from "@/db";
import { deposits } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { MIN_DEPOSIT } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const amount = Math.round(Number(body?.amount ?? 0) * 100) / 100;
  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) {
    return NextResponse.json({ error: `Минимальное пополнение — ${MIN_DEPOSIT} G` }, { status: 400 });
  }

  const code = `${Math.floor(100000 + Math.random() * 899999)}`;
  const created = await db.insert(deposits).values({ code, userId: user.id, amount }).returning();
  return NextResponse.json({ ok: true, code: created[0].code });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const rows = await db
    .select()
    .from(deposits)
    .where(eq(deposits.userId, user.id))
    .orderBy(desc(deposits.id))
    .limit(20);
  return NextResponse.json({ deposits: rows });
}
