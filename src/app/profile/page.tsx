"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SkinCard from "@/components/SkinCard";
import Coin from "@/components/Coin";
import Toast, { type ToastMsg } from "@/components/Toast";
import { api, fmt, getJson, useMe } from "@/lib/client";

type InvItem = { id: number; status: string; name: string; weapon: string; rarity: string; price: number };
type Withdrawal = {
  id: number;
  skinName: string;
  netAmount: number;
  listAmount: number;
  tradeSkin: string;
  status: string;
};

export default function ProfilePage() {
  const { me, loading, refresh } = useMe();
  const [inv, setInv] = useState<InvItem[]>([]);
  const [wds, setWds] = useState<Withdrawal[]>([]);
  const [promo, setPromo] = useState("");
  const [avatar, setAvatar] = useState("");
  const [msg, setMsg] = useState<ToastMsg | null>(null);

  async function load() {
    try {
      const [i, w] = await Promise.all([
        getJson<{ items: InvItem[] }>("/api/inventory"),
        getJson<{ withdrawals: Withdrawal[] }>("/api/withdrawals"),
      ]);
      setInv(i.items);
      setWds(w.withdrawals);
    } catch {
      setInv([]);
      setWds([]);
    }
  }

  useEffect(() => {
    if (me) void load();
  }, [me?.id]);

  async function redeem() {
    try {
      const res = await api<{ amount: number }>("/api/coupons/redeem", { code: promo });
      setMsg({ text: `Промокод активирован: +${fmt(res.amount)} G`, ok: true });
      setPromo("");
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  async function sell(item: InvItem) {
    try {
      const res = await api<{ payout: number }>("/api/inventory/sell", { inventoryId: item.id });
      setMsg({ text: `Продано за ${fmt(res.payout)} G`, ok: true });
      await Promise.all([refresh(), load()]);
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  async function withdraw(item: InvItem) {
    try {
      await api("/api/withdrawals", { inventoryId: item.id });
      setMsg({ text: "Заявка создана — смотрите инструкцию ниже", ok: true });
      await load();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  async function saveAvatar() {
    try {
      await api("/api/profile", { avatarUrl: avatar });
      setMsg({ text: "Аватар обновлён", ok: true });
      setAvatar("");
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  if (!loading && !me) {
    return (
      <div className="min-h-screen">
        <SiteHeader me={me} loading={loading} />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="panel p-8">
            <div className="text-4xl">🔒</div>
            <p className="mt-3 text-slate-300">Войдите, чтобы открыть профиль</p>
            <Link href="/login" className="btn btn-primary mt-5 w-full py-3">
              Войти
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalValue = inv.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader me={me} loading={loading} />
      <Toast msg={msg} onClose={() => setMsg(null)} />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {/* профиль */}
        <section className="panel relative overflow-hidden p-5 sm:p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70"
            style={{
              background:
                "radial-gradient(60% 100% at 20% 0%, rgba(249,115,22,0.28), transparent 70%), radial-gradient(50% 100% at 80% 0%, rgba(124,58,237,0.25), transparent 70%)",
            }}
          />
          <div className="relative flex flex-wrap items-center gap-5">
            {me ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={me.avatarUrl}
                alt=""
                className="h-24 w-24 rounded-2xl border border-white/15 bg-black/40 object-cover shadow-2xl"
              />
            ) : null}
            <div>
              <div className="eyebrow">игрок</div>
              <div className="display text-3xl">{me?.login}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip">
                  <Coin size={13} /> {fmt(me?.balance ?? 0)} баланс
                </span>
                <span className="chip">🎒 {inv.length} предметов</span>
                <span className="chip">💎 {fmt(totalValue)} G в инвентаре</span>
              </div>
            </div>
            <div className="ml-auto flex flex-col gap-2 sm:w-52">
              <Link href="/topup" className="btn btn-primary py-3">
                Пополнить от 50 G
              </Link>
              <Link href="/" className="btn btn-ghost py-3">
                К апгрейду
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="panel p-5">
            <div className="eyebrow">персональный купон</div>
            <h2 className="display mt-1 text-xl">Промокод</h2>
            <p className="mt-1 text-xs text-slate-400">Введите код, выданный администрацией StandUp.</p>
            <div className="mt-3 flex gap-2">
              <input
                className="input uppercase tracking-widest"
                placeholder="GGS22"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && redeem()}
              />
              <button onClick={redeem} className="btn btn-primary px-5">
                Активировать
              </button>
            </div>
          </section>

          <section className="panel p-5">
            <div className="eyebrow">идентификация</div>
            <h2 className="display mt-1 text-xl">Аватар</h2>
            <p className="mt-1 text-xs text-slate-400">
              Аватар на сайте должен совпадать с аватаркой в игре — по ней мы находим вас при выводе.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                className="input"
                placeholder="https://ссылка-на-аватар.png"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <button onClick={saveAvatar} className="btn btn-ghost px-5">
                Сохранить
              </button>
            </div>
          </section>
        </div>

        {/* мои скины */}
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">инвентарь</div>
              <h2 className="display mt-1 text-2xl">МОИ СКИНЫ</h2>
            </div>
            <span className="chip">Продажа: 90% от рынка</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/12 to-transparent p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-lg">⚠️</span>
              <span className="text-sm font-black uppercase tracking-wider">внимание перед выводом</span>
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-amber-50/85">
              <li>
                • Аватарка на сайте <b>обязана соответствовать аватарке в игре</b> Standoff 2. Если не совпадает —
                заявка отклоняется.
              </li>
              <li>
                • Для получения голды выставьте на продажу в игре скин <b>M4 «FLOCK»</b> на сумму, указанную в заявке.
              </li>
              <li>
                • Комиссию Standoff 2 (20%) <b>кроем мы</b>: сумма выставления считается так, чтобы после вычета 20% вам
                пришло ровно столько, сколько стоит скин. Пример: вывод 100 G → выставить <b>125.00 G</b>.
              </li>
            </ul>
          </div>

          {inv.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/12 py-12 text-center text-sm text-slate-500">
              Инвентарь пуст — купите скин в магазине или выиграйте в апгрейде
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {inv.map((i) => (
                <SkinCard
                  key={i.id}
                  weapon={i.weapon}
                  name={i.name}
                  rarity={i.rarity}
                  price={i.price}
                  badge={i.status === "withdraw_pending" ? "вывод" : undefined}
                  footer={
                    i.status === "owned" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => sell(i)} className="btn btn-ghost flex-1 px-2 py-1.5 text-[11px]">
                          Продать
                        </button>
                        <button onClick={() => withdraw(i)} className="btn btn-primary flex-1 px-2 py-1.5 text-[11px]">
                          Вывести
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-orange-500/15 py-1.5 text-center text-[11px] font-black text-orange-300">
                        ожидает выдачи
                      </div>
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* выводы */}
        <section className="panel p-5 sm:p-6">
          <div className="eyebrow">заявки</div>
          <h2 className="display mt-1 text-2xl">МОИ ВЫВОДЫ</h2>

          {wds.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-white/12 py-10 text-center text-sm text-slate-500">
              Заявок пока нет
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {wds.map((w) => (
                <div key={w.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black">
                      <span className="text-slate-500">#{w.id}</span> {w.skinName}
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${
                        w.status === "done"
                          ? "bg-green-500/15 text-green-300"
                          : w.status === "declined"
                            ? "bg-red-500/15 text-red-300"
                            : "bg-orange-500/15 text-orange-300"
                      }`}
                    >
                      {w.status === "done" ? "выдано" : w.status === "declined" ? "отклонено" : "в обработке"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="panel-tight p-3">
                      <div className="eyebrow">выставить скин</div>
                      <div className="mt-1 font-black text-white">{w.tradeSkin}</div>
                    </div>
                    <div className="panel-tight p-3">
                      <div className="eyebrow">сумма выставления</div>
                      <div className="mt-1 flex items-center gap-1.5 text-lg font-black text-amber-300">
                        <Coin size={15} /> {w.listAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="panel-tight p-3">
                      <div className="eyebrow">получите после −20%</div>
                      <div className="mt-1 text-lg font-black text-green-400">{w.netAmount.toFixed(2)} G</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
