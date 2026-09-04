"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fmt, getJson } from "@/lib/client";

export default function QrWaiter({
  code,
  amount,
  qr,
  payUrl,
  paid,
}: {
  code: string;
  amount: number;
  qr: string;
  payUrl: string;
  paid: boolean;
}) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState(paid);

  useEffect(() => {
    if (isPaid) {
      const t = setTimeout(() => router.push("/profile"), 900);
      return () => clearTimeout(t);
    }
    const timer = setInterval(async () => {
      try {
        const data = await getJson<{ deposit: { status: string } }>(`/api/deposits/${code}`);
        if (data.deposit.status === "paid") setIsPaid(true);
      } catch {
        /* ignore */
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [code, isPaid, router]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="text-center">
        <div className="display text-2xl tracking-tight sm:text-[32px]">
          Сумма: <span className="grad-brand">{fmt(amount)} G</span>{" "}
          <span className="text-slate-600">;</span> Код: <span className="text-white">{code}</span>
        </div>

        {isPaid ? (
          <div className="pop-in mt-10 text-2xl font-black text-green-400">Оплачено — переходим в профиль…</div>
        ) : (
          <a href={payUrl} target="_blank" rel="noreferrer" className="mt-8 inline-block">
            <div
              className="rounded-[28px] bg-white p-4 shadow-[0_40px_120px_-40px_rgba(249,115,22,0.7)]"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 40px 120px -40px rgba(249,115,22,0.75)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR"
                width={340}
                height={340}
                className="h-[300px] w-[300px] rounded-[16px] sm:h-[360px] sm:w-[360px]"
              />
            </div>
          </a>
        )}
      </div>
    </main>
  );
}
