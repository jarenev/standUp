import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/db";
import { deposits } from "@/db/schema";
import { eq } from "drizzle-orm";
import QrWaiter from "./QrWaiter";

export const dynamic = "force-dynamic";

export default async function DepositQrPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const rows = await db.select().from(deposits).where(eq(deposits.code, code)).limit(1);
  const dep = rows[0];
  if (!dep) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const payUrl = `${proto}://${host}/pay/${dep.code}`;

  const qr = await QRCode.toDataURL(payUrl, {
    width: 720,
    margin: 1,
    color: { dark: "#0b0f17", light: "#ffffff" },
  });

  return (
    <QrWaiter
      code={dep.code}
      amount={Number(dep.amount)}
      qr={qr}
      payUrl={payUrl}
      paid={dep.status === "paid"}
    />
  );
}
