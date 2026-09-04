import { NextResponse } from "next/server";
import { db } from "@/db";
import { skins } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const rows = await db.select().from(skins).orderBy(asc(skins.price));
  return NextResponse.json({ skins: rows.map((s) => ({ ...s, price: Number(s.price) })) });
}
