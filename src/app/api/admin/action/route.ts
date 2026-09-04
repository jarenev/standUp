import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, inventory, upgrades, users, withdrawals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { setSetting } from "@/lib/game";
import { resolveUpgrade } from "@/lib/upgrade";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? "");

  if (action === "rig") {
    await setSetting("rig_mode", body?.enabled ? "on" : "off");
    return NextResponse.json({ ok: true });
  }

  if (action === "upgrade") {
    const id = Number(body?.id);
    const decision = String(body?.decision ?? "");
    const rows = await db.select().from(upgrades).where(eq(upgrades.id, id)).limit(1);
    const up = rows[0];
    if (!up || up.status !== "pending_admin") {
      return NextResponse.json({ error: "Заявка уже обработана" }, { status: 400 });
    }
    if (decision === "refund") {
      if (Number(up.betAmount) > 0) {
        await db
          .update(users)
          .set({ balance: sql`${users.balance} + ${Number(up.betAmount)}` })
          .where(eq(users.id, up.userId));
      }
      if (up.betInventoryId) {
        await db.update(inventory).set({ status: "owned" }).where(eq(inventory.id, up.betInventoryId));
      }
      await db.update(upgrades).set({ status: "declined" }).where(eq(upgrades.id, id));
      return NextResponse.json({ ok: true });
    }
    await resolveUpgrade(id, decision === "win");
    return NextResponse.json({ ok: true });
  }

  if (action === "withdrawal") {
    const id = Number(body?.id);
    const decision = String(body?.decision ?? "");
    const rows = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
    const w = rows[0];
    if (!w || w.status !== "pending") return NextResponse.json({ error: "Уже обработано" }, { status: 400 });

    if (decision === "done") {
      if (w.inventoryId) {
        await db.update(inventory).set({ status: "withdrawn" }).where(eq(inventory.id, w.inventoryId));
      }
      await db.update(withdrawals).set({ status: "done" }).where(eq(withdrawals.id, id));
    } else {
      if (w.inventoryId) {
        await db.update(inventory).set({ status: "owned" }).where(eq(inventory.id, w.inventoryId));
      }
      await db.update(withdrawals).set({ status: "declined" }).where(eq(withdrawals.id, id));
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "coupon.create") {
    const code = String(body?.code ?? "").trim().toUpperCase();
    const amount = Number(body?.amount ?? 0);
    const maxActivations = Math.max(1, Number(body?.maxActivations ?? 1));
    if (!code || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Некорректный купон" }, { status: 400 });
    }
    await db
      .insert(coupons)
      .values({ code, amount, maxActivations })
      .onConflictDoUpdate({ target: coupons.code, set: { amount, maxActivations } });
    return NextResponse.json({ ok: true });
  }

  if (action === "coupon.delete") {
    await db.delete(coupons).where(eq(coupons.id, Number(body?.id)));
    return NextResponse.json({ ok: true });
  }

  if (action === "user.balance") {
    const id = Number(body?.id);
    const amount = Number(body?.amount ?? 0);
    await db
      .update(users)
      .set({ balance: sql`GREATEST(0, ${users.balance} + ${amount})` })
      .where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}
