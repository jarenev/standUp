"use client";

import { useEffect, useState, use } from "react";

export default function PayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/deposits/${code}/pay`, { method: "POST" });
        const data = (await res.json()) as { ok?: boolean; amount?: number; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Платёж не найден");
          setState("error");
          return;
        }
        setAmount(Number(data.amount ?? 0));
        setState("ok");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      {state === "loading" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400/25 border-t-orange-400" />
          <div className="text-sm font-bold uppercase tracking-widest text-slate-500">обработка платежа</div>
        </div>
      ) : state === "ok" ? (
        <div className="pop-in">
          <div className="pulse-ring mx-auto grid h-36 w-36 place-items-center rounded-full bg-green-500/12 ring-1 ring-green-400/40">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_20px_60px_-20px_rgba(34,197,94,0.9)]">
              <svg viewBox="0 0 24 24" className="h-14 w-14 text-black/85" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l5.5 5.5 9.5-11" />
              </svg>
            </div>
          </div>
          <h1 className="display mt-8 text-5xl text-green-400">Успешно</h1>
          <p className="mt-3 text-lg text-slate-300">
            Баланс пополнен на <b className="text-amber-300">{amount} G</b>
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-slate-600">код платежа · {code}</p>
        </div>
      ) : (
        <div className="pop-in">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-red-500/12 ring-1 ring-red-400/40 text-5xl">
            ✕
          </div>
          <h1 className="display mt-6 text-4xl text-red-400">Ошибка</h1>
          <p className="mt-2 text-slate-400">{error}</p>
        </div>
      )}
    </main>
  );
}
