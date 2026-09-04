"use client";

import { useCallback, useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Coin from "@/components/Coin";
import Toast, { type ToastMsg } from "@/components/Toast";
import { api, fmt, getJson, useMe } from "@/lib/client";

type PendingUpgrade = {
  id: number;
  login: string;
  avatarUrl: string;
  betAmount: number;
  skinValue: number;
  stake: number;
  betSkin: string | null;
  target: string | null;
  multiplier: number;
  chance: number;
  speed: string;
  potential: number;
};
type AdminWithdrawal = {
  id: number;
  login: string;
  avatarUrl: string;
  skinName: string;
  netAmount: number;
  listAmount: number;
  tradeSkin: string;
  pattern: string;
  status: string;
};
type Coupon = { id: number; code: string; amount: number; maxActivations: number; usedActivations: number };
type AdminUser = { id: number; login: string; balance: number; avatarUrl: string; isAdmin: boolean };
type State = {
  rig: boolean;
  pendingUpgrades: PendingUpgrade[];
  withdrawals: AdminWithdrawal[];
  coupons: Coupon[];
  users: AdminUser[];
  stats: { items: number; players: number };
};

export default function AdminPage() {
  const { me, loading } = useMe();
  const [state, setState] = useState<State | null>(null);
  const [tab, setTab] = useState<"upgrades" | "withdrawals" | "coupons" | "users">("upgrades");
  const [couponCode, setCouponCode] = useState("");
  const [couponAmount, setCouponAmount] = useState("100");
  const [couponMax, setCouponMax] = useState("1");
  const [msg, setMsg] = useState<ToastMsg | null>(null);

  const load = useCallback(async () => {
    try {
      setState(await getJson<State>("/api/admin/state"));
    } catch {
      /* ignore polling errors */
    }
  }, []);

  useEffect(() => {
    if (!me?.isAdmin) return;
    void load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [me?.isAdmin, load]);

  async function act(body: Record<string, unknown>) {
    try {
      await api("/api/admin/action", body);
      await load();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  if (loading) return null;

  if (!me?.isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader me={me} loading={loading} />
        <main className="grid min-h-[70vh] place-items-center px-4 text-center">
          <div>
            <div className="display text-8xl text-slate-800">404</div>
            <p className="mt-3 text-slate-600">Страница не найдена</p>
          </div>
        </main>
      </div>
    );
  }

  const pendingW = state?.withdrawals.filter((w) => w.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader me={me} loading={loading} />
      <Toast msg={msg} onClose={() => setMsg(null)} />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <section className="panel flex flex-wrap items-center gap-5 p-5 sm:p-6">
          <div>
            <div className="eyebrow">служебный доступ</div>
            <h1 className="display mt-1 text-3xl">
              АДМИН-<span className="grad-brand">ПАНЕЛЬ</span>
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">👥 игроков: {state?.stats.players ?? 0}</span>
              <span className="chip">🎒 предметов: {state?.stats.items ?? 0}</span>
              <span className="chip">📦 выводов в работе: {pendingW}</span>
            </div>
          </div>

          <div
            className={`ml-auto flex items-center gap-4 rounded-2xl border p-4 transition ${
              state?.rig ? "border-orange-400/50 bg-orange-500/10" : "border-white/10 bg-black/30"
            }`}
          >
            <div>
              <div className="text-sm font-black">Подкрутка</div>
              <div className="text-[11px] text-slate-400">Все апгрейды ждут решения админа</div>
            </div>
            <button
              onClick={() => act({ action: "rig", enabled: !state?.rig })}
              className={`relative h-9 w-16 rounded-full border transition ${
                state?.rig ? "border-orange-400/70 bg-orange-500" : "border-white/15 bg-white/10"
              }`}
              aria-label="Переключить подкрутку"
            >
              <span
                className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
                  state?.rig ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["upgrades", "Апгрейды", state?.pendingUpgrades.length ?? 0],
              ["withdrawals", "Выводы", pendingW],
              ["coupons", "Купоны", state?.coupons.length ?? 0],
              ["users", "Игроки", state?.users.length ?? 0],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`btn px-4 py-2.5 text-sm ${tab === key ? "btn-primary" : "btn-ghost"}`}
            >
              {label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                  tab === key ? "bg-black/25" : "bg-white/10 text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {tab === "upgrades" ? (
          <section className="panel p-5">
            <h2 className="display text-xl">Заявки на апгрейд</h2>
            {!state?.pendingUpgrades.length ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/12 py-10 text-center text-sm text-slate-500">
                {state?.rig
                  ? "Ждём ставки игроков…"
                  : "Подкрутка выключена — апгрейды решаются честным рандомом"}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {state.pendingUpgrades.map((u) => (
                  <div key={u.id} className="rounded-2xl border border-orange-400/25 bg-orange-500/[0.06] p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatarUrl} alt="" className="h-14 w-14 rounded-xl border border-white/10 object-cover" />
                      <div>
                        <div className="text-base font-black">{u.login}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className="chip">
                            <Coin size={12} /> ставка {fmt(u.stake)}
                          </span>
                          <span className="chip text-orange-300">x{u.multiplier}</span>
                          <span className="chip text-green-300">шанс {u.chance}%</span>
                          <span className="chip">{u.speed === "slow" ? "🐢 медленно" : "⚡ быстро"}</span>
                          <span className="chip text-amber-300">выплата {fmt(u.potential)} G</span>
                        </div>
                        {u.betSkin || u.target ? (
                          <div className="mt-1.5 text-xs text-slate-400">
                            {u.betSkin ? <>скин в ставке: <b className="text-slate-200">{u.betSkin}</b> </> : null}
                            {u.target ? <>· цель: <b className="text-slate-200">{u.target}</b></> : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="ml-auto flex flex-wrap gap-2">
                        <button onClick={() => act({ action: "upgrade", id: u.id, decision: "win" })} className="btn btn-green px-4 py-2.5 text-sm">
                          Победа
                        </button>
                        <button onClick={() => act({ action: "upgrade", id: u.id, decision: "lose" })} className="btn btn-red px-4 py-2.5 text-sm">
                          Проигрыш
                        </button>
                        <button onClick={() => act({ action: "upgrade", id: u.id, decision: "refund" })} className="btn btn-ghost px-3 py-2.5 text-sm">
                          Возврат
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === "withdrawals" ? (
          <section className="panel p-5">
            <h2 className="display text-xl">Выводы скинов</h2>
            {!state?.withdrawals.length ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/12 py-10 text-center text-sm text-slate-500">
                Заявок нет
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {state.withdrawals.map((w) => (
                  <div key={w.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.avatarUrl} alt="" className="h-20 w-20 rounded-xl border border-white/10 object-cover" />
                      <a
                        href={w.avatarUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300"
                      >
                        скачать
                      </a>
                    </div>
                    <div>
                      <div className="text-base font-black">
                        {w.login} <span className="text-slate-600">#{w.id}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-300">Скин: {w.skinName}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="chip">выставить: {w.tradeSkin}</span>
                        <span className="chip text-amber-300">
                          <Coin size={12} /> {w.listAmount.toFixed(2)}
                        </span>
                        <span className="chip text-green-300">игроку {w.netAmount.toFixed(2)} G</span>
                        <span className="chip text-slate-200">паттерн: {w.pattern || "—"}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {w.status === "pending" ? (
                        <>
                          <button onClick={() => act({ action: "withdrawal", id: w.id, decision: "done" })} className="btn btn-green px-4 py-2.5 text-sm">
                            Выполнено
                          </button>
                          <button onClick={() => act({ action: "withdrawal", id: w.id, decision: "declined" })} className="btn btn-red px-4 py-2.5 text-sm">
                            Отклонить
                          </button>
                        </>
                      ) : (
                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase ${
                            w.status === "done" ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {w.status === "done" ? "выдано" : "отклонено"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === "coupons" ? (
          <section className="panel p-5">
            <h2 className="display text-xl">Купоны и промокоды</h2>
            <p className="mt-1 text-xs text-slate-400">Купон: название · сколько даёт · кол-во активаций.</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <input className="input uppercase" placeholder="НАЗВАНИЕ" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
              <input className="input" placeholder="Сумма, G" value={couponAmount} onChange={(e) => setCouponAmount(e.target.value.replace(/[^\d.]/g, ""))} />
              <input className="input" placeholder="Активаций" value={couponMax} onChange={(e) => setCouponMax(e.target.value.replace(/[^\d]/g, ""))} />
              <button
                onClick={() =>
                  act({
                    action: "coupon.create",
                    code: couponCode,
                    amount: Number(couponAmount),
                    maxActivations: Number(couponMax),
                  }).then(() => setCouponCode(""))
                }
                className="btn btn-primary py-2.5"
              >
                Создать
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {state?.coupons.map((c) => {
                const pct = Math.min(100, (c.usedActivations / Math.max(1, c.maxActivations)) * 100);
                return (
                  <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                    <span className="font-mono text-sm font-black tracking-widest text-orange-300">{c.code}</span>
                    <span className="chip text-amber-300">
                      <Coin size={12} /> +{fmt(c.amount)}
                    </span>
                    <div className="min-w-[140px] flex-1">
                      <div className="mb-1 text-[11px] font-bold text-slate-400">
                        активаций {c.usedActivations}/{c.maxActivations}
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button onClick={() => act({ action: "coupon.delete", id: c.id })} className="btn btn-ghost px-3 py-1.5 text-xs">
                      Удалить
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {tab === "users" ? (
          <section className="panel p-5">
            <h2 className="display text-xl">Игроки</h2>
            <div className="mt-4 space-y-2">
              {state?.users.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatarUrl} alt="" className="h-10 w-10 rounded-lg border border-white/10 object-cover" />
                  <span className="font-bold">{u.login}</span>
                  {u.isAdmin ? (
                    <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-orange-300">
                      ADMIN
                    </span>
                  ) : null}
                  <span className="ml-auto flex items-center gap-1.5 font-black text-amber-300">
                    <Coin size={13} /> {fmt(u.balance)}
                  </span>
                  <div className="flex gap-1">
                    {[100, 1000, -100].map((v) => (
                      <button
                        key={v}
                        onClick={() => act({ action: "user.balance", id: u.id, amount: v })}
                        className="btn btn-ghost px-2.5 py-1.5 text-xs"
                      >
                        {v > 0 ? `+${v}` : `−${Math.abs(v)}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
