"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Coin from "@/components/Coin";
import { api, fmt, getJson, useMe } from "@/lib/client";

type Deposit = { id: number; code: string; amount: number; status: string };

export default function TopUpPage() {
  const router = useRouter();
  const { me, loading } = useMe();
  const [amount, setAmount] = useState("50");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Deposit[]>([]);

  useEffect(() => {
    if (!me) return;
    void getJson<{ deposits: Deposit[] }>("/api/deposits")
      .then((d) => setHistory(d.deposits))
      .catch(() => setHistory([]));
  }, [me?.id]);

  async function create() {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ code: string }>("/api/deposits", { amount: Number(amount) });
      router.push(`/topup/${res.code}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const low = Number(amount) < 50;

  return (
    <div className="min-h-screen">
      <SiteHeader me={me} loading={loading} />

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <section className="panel relative overflow-hidden p-6">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.65), transparent 70%)" }}
          />
          <div className="eyebrow">касса</div>
          <h1 className="display mt-1 text-3xl">
            ПОПОЛНЕНИЕ <span className="grad-brand">БАЛАНСА</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Минимальная сумма — <b className="text-amber-300">50 G</b>. После нажатия появится QR-код: отсканируйте его,
            и голда мгновенно зачислится.
          </p>

          <div className="mt-5">
            <label className="eyebrow">сумма пополнения</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <Coin size={20} />
              </span>
              <input
                className="input py-4 pl-11 text-2xl font-black"
                value={amount}
                inputMode="decimal"
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[50, 100, 250, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className={`btn py-2 text-sm ${Number(amount) === v ? "btn-primary" : "btn-ghost"}`}
                >
                  {v}
                </button>
              ))}
            </div>

            {low ? <div className="mt-3 text-sm font-bold text-red-400">Минимум 50 G</div> : null}
            {error ? <div className="mt-3 text-sm font-bold text-red-400">{error}</div> : null}

            <button onClick={create} disabled={busy || low || !me} className="btn btn-primary mt-4 w-full py-4 text-lg">
              {me ? (busy ? "Создаём платёж…" : `Пополнить на ${fmt(Number(amount) || 0)} G`) : "Войдите в аккаунт"}
            </button>
          </div>
        </section>

        {history.length ? (
          <section className="panel p-5">
            <div className="eyebrow">история</div>
            <h2 className="display mt-1 text-xl">Пополнения</h2>
            <div className="mt-3 space-y-2">
              {history.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/25 px-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-slate-500">#{d.code}</span>
                  <span className="ml-auto flex items-center gap-1.5 font-black text-amber-300">
                    <Coin size={12} /> {fmt(Number(d.amount))}
                  </span>
                  <span
                    className={`w-24 text-right text-xs font-black uppercase ${
                      d.status === "paid" ? "text-green-400" : "text-orange-300"
                    }`}
                  >
                    {d.status === "paid" ? "оплачено" : "ожидает"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
