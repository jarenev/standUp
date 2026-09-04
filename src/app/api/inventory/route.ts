import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, skins } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const rows = await db
    .select({
      id: inventory.id,
      status: inventory.status,
      skinId: skins.id,
      name: skins.name,
      weapon: skins.weapon,
      rarity: skins.rarity,
      price: skins.price,
    })
    .from(inventory)
    .innerJoin(skins, eq(inventory.skinId, skins.id))
    .where(and(eq(inventory.userId, user.id), inArray(inventory.status, ["owned", "withdraw_pending"])))
    .orderBy(desc(inventory.id));

  return NextResponse.json({ items: rows.map((r) => ({ ...r, price: Number(r.price) })) });
}
