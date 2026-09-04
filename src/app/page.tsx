"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SkinCard from "@/components/SkinCard";
import UpgradeBar, { type Spin } from "@/components/UpgradeBar";
import WeaponArt from "@/components/WeaponArt";
import Coin from "@/components/Coin";
import Toast, { type ToastMsg } from "@/components/Toast";
import LiveFeed from "@/components/LiveFeed";
import { api, fmt, getJson, useMe } from "@/lib/client";
import { RARITY_COLORS } from "@/lib/skins-data";

type Skin = { id: number; name: string; weapon: string; rarity: string; price: number };
type InvItem = {
  id: number;
  status: string;
  skinId: number;
  name: string;
  weapon: string;
  rarity: string;
  price: number;
};

const HOUSE = 95;
const RARITY_ORDER = ["all", "nameless", "arcane", "legendary", "epic", "rare", "uncommon", "common"];

export default function HomePage() {
  const { me, loading, refresh } = useMe();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [inv, setInv] = useState<InvItem[]>([]);
  const [bet, setBet] = useState("50");
  const [invId, setInvId] = useState<number | null>(null);
  const [mode, setMode] = useState<"chance" | "target">("chance");
  const [chance, setChance] = useState(50);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [speed, setSpeed] = useState<"fast" | "slow">("fast");
  const [spin, setSpin] = useState<Spin | null>(null);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [feedKey, setFeedKey] = useState(0);

  async function loadAll() {
    const s = await getJson<{ skins: Skin[] }>("/api/shop");
    setSkins(s.skins);
    try {
      const i = await getJson<{ items: InvItem[] }>("/api/inventory");
      setInv(i.items);
    } catch {
      setInv([]);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [me?.id]);

  const betSkin = inv.find((i) => i.id === invId) ?? null;
  const stake = Math.round(((Number(bet) || 0) + (betSkin?.price ?? 0)) * 100) / 100;
  const target = skins.find((s) => s.id === targetId) ?? null;

  const { multiplier, effChance, errorHint } = useMemo(() => {
    if (mode === "target" && target) {
      if (stake <= 0) return { multiplier: 0, effChance: 0, errorHint: "Укажите ставку" };
      const m = Math.round((target.price / stake) * 100) / 100;
      const c = Math.round((HOUSE / m) * 100) / 100;
      if (m < 1.06)
        return { multiplier: m, effChance: c, errorHint: "Цель слишком дешёвая — выберите дороже или уменьшите ставку" };
      if (c < 1) return { multiplier: m, effChance: c, errorHint: "Шанс меньше 1% — выберите цель подешевле" };
      return { multiplier: m, effChance: c, errorHint: "" };
    }
    const c = Math.min(90, Math.max(1, chance));
    return { multiplier: Math.round((HOUSE / c) * 100) / 100, effChance: c, errorHint: "" };
  }, [mode, target, stake, chance]);

  const payout = mode === "target" && target ? target.price : Math.round(stake * multiplier * 100) / 100;

  async function doUpgrade() {
    if (!me) {
      setMsg({ text: "Сначала войдите в аккаунт", ok: false });
      return;
    }
    setBusy(true);
    setMsg(null);
    setSpin(null);
    try {
      const res = await api<{
        id: number;
        status: string;
        win?: boolean;
        landing?: number;
        payout?: number;
      }>("/api/upgrade", {
        betAmount: Number(bet) || 0,
        inventoryId: invId,
        targetSkinId: mode === "target" ? targetId : null,
        chance: effChance,
        speed,
      });

      let result = res;
      if (res.status === "pending_admin") {
        setWaiting(true);
        result = await pollUpgrade(res.id);
        setWaiting(false);
        if (result.status === "declined") {
          setMsg({ text: "Ставка отменена, средства возвращены", ok: false });
          await Promise.all([refresh(), loadAll()]);
          setBusy(false);
          return;
        }
      }

      setSpin({ token: Date.now(), landing: Number(result.landing ?? 0.9), win: Boolean(result.win) });
      const won = Number(result.payout ?? 0);
      setTimeout(
        () => {
          setMsg(
            result.win
              ? {
                  text:
                    mode === "target" && target
                      ? `Успех! ${target.weapon} «${target.name}» в инвентаре`
                      : `Успех! +${fmt(won)} G на баланс`,
                  ok: true,
                }
              : { text: "Апгрейд не удался. Попробуйте ещё раз", ok: false },
          );
          void Promise.all([refresh(), loadAll()]);
          setFeedKey((k) => k + 1);
          setInvId(null);
        },
        speed === "slow" ? 5500 : 2800,
      );
    } catch (e) {
      setWaiting(false);
      setMsg({ text: (e as Error).message, ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function pollUpgrade(id: number) {
    for (let i = 0; i < 300; i += 1) {
      await new Promise((r) => setTimeout(r, 1500));
      const data = await getJson<{
        id: number;
        status: string;
        win: boolean | null;
        landing: number | null;
        payout: number;
      }>(`/api/upgrade/${id}`);
      if (data.status !== "pending_admin") {
        return { ...data, win: data.win ?? false, landing: data.landing ?? 0.9 };
      }
    }
    throw new Error("Время ожидания истекло");
  }

  async function buy(skin: Skin) {
    try {
      await api("/api/shop/buy", { skinId: skin.id });
      setMsg({ text: `Куплен ${skin.weapon} «${skin.name}»`, ok: true });
      await Promise.all([refresh(), loadAll()]);
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    }
  }

  const filtered = skins
    .filter((s) => (rarityFilter === "all" ? true : s.rarity === rarityFilter))
    .filter((s) => `${s.weapon} ${s.name}`.toLowerCase().includes(search.trim().toLowerCase()));

  const ownedInv = inv.filter((i) => i.status === "owned");
  const targetColor = target ? (RARITY_COLORS[target.rarity]?.border ?? "#f97316") : "#f97316";

  return (
    <div className="min-h-screen">
      <SiteHeader me={me} loading={loading} />
      <Toast msg={msg} onClose={() => setMsg(null)} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <LiveFeed refreshKey={feedKey} />

        {/* ------- APGRADE ------- */}
        <section className="panel overflow-hidden p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">режим игры</div>
              <h1 className="display mt-1 text-3xl sm:text-4xl">
                АПГРЕЙД <span className="grad-brand">СКИНОВ</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip">🎯 шанс до 90%</span>
              <span className="chip">⚙️ комиссия 5%</span>
              <span className="chip">💰 мин. депозит 50 G</span>
            </div>
          </div>

          <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
            {/* ставка */}
            <div className="panel-tight p-4">
              <div className="eyebrow mb-3">ваша ставка</div>
              <div className="flex h-[120px] items-center justify-center rounded-xl bg-black/30">
                {betSkin ? (
                  <div className="flex items-center gap-3 px-3">
                    <WeaponArt
                      weapon={betSkin.weapon}
                      color={RARITY_COLORS[betSkin.rarity]?.border ?? "#94a3b8"}
                      className="h-14 w-24 floaty"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {betSkin.weapon}
                      </div>
                      <div className="truncate text-sm font-extrabold">{betSkin.name}</div>
                      <div className="text-xs font-black text-amber-300">+{fmt(betSkin.price)} G</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Coin size={26} />
                      <span className="text-3xl font-black text-white">{fmt(Number(bet) || 0)}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">голда</div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-xs">
                <span className="font-bold text-slate-400">Итого в игре</span>
                <span className="flex items-center gap-1.5 font-black text-amber-300">
                  <Coin size={12} /> {fmt(stake)}
                </span>
              </div>
            </div>

            {/* шкала */}
            <div className="mx-auto">
              <UpgradeBar chance={effChance} speed={speed} spin={spin} waiting={waiting} />
            </div>

            {/* выигрыш */}
            <div className="panel-tight p-4">
              <div className="eyebrow mb-3">вы получите</div>
              <div
                className="flex h-[120px] items-center justify-center rounded-xl"
                style={{ background: `radial-gradient(65% 80% at 50% 50%, ${targetColor}22, rgba(0,0,0,0.32))` }}
              >
                {mode === "target" && target ? (
                  <div className="flex items-center gap-3 px-3">
                    <WeaponArt weapon={target.weapon} color={targetColor} className="h-14 w-24 floaty" />
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {target.weapon}
                      </div>
                      <div className="truncate text-sm font-extrabold">{target.name}</div>
                      <div className="text-xs font-black text-amber-300">{fmt(target.price)} G</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Coin size={26} />
                      <span className="text-3xl font-black text-white">{fmt(payout)}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      при удаче
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-xs">
                <span className="font-bold text-slate-400">Множитель</span>
                <span className="text-base font-black text-orange-400">x{multiplier || 0}</span>
              </div>
            </div>
          </div>

          {/* ------- controls ------- */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="panel-tight p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="eyebrow">ставка балансом</div>
                <button
                  onClick={() => setBet(String(Math.floor(me?.balance ?? 0)))}
                  className="text-[11px] font-black uppercase tracking-wider text-orange-400 hover:text-orange-300"
                >
                  всё: {fmt(me?.balance ?? 0)} G
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Coin size={16} />
                  </span>
                  <input
                    className="input pl-9 text-lg font-black"
                    value={bet}
                    inputMode="decimal"
                    onChange={(e) => setBet(e.target.value.replace(/[^\d.]/g, ""))}
                  />
                </div>
                <button onClick={() => setBet(String(Math.max(0, (Number(bet) || 0) / 2)))} className="btn btn-ghost px-3">
                  ½
                </button>
                <button onClick={() => setBet(String((Number(bet) || 0) * 2))} className="btn btn-ghost px-3">
                  ×2
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[50, 100, 250, 500, 1000, 5000].map((v) => (
                  <button key={v} onClick={() => setBet(String(v))} className="btn btn-ghost px-2.5 py-1 text-xs">
                    {v}
                  </button>
                ))}
              </div>

              <div className="mt-4 eyebrow">скорость апгрейда</div>
              <div className="seg mt-2 w-full">
                <button data-active={speed === "fast"} onClick={() => setSpeed("fast")} className="flex-1">
                  ⚡ Быстро
                </button>
                <button data-active={speed === "slow"} onClick={() => setSpeed("slow")} className="flex-1">
                  🐢 Медленно
                </button>
              </div>
            </div>

            <div className="panel-tight p-4">
              <div className="seg w-full">
                <button data-active={mode === "chance"} onClick={() => setMode("chance")} className="flex-1">
                  Шанс / иксы
                </button>
                <button data-active={mode === "target"} onClick={() => setMode("target")} className="flex-1">
                  До скина
                </button>
              </div>

              {mode === "chance" ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-black text-green-400">шанс {chance}%</span>
                    <span className="font-black text-orange-400">x{multiplier}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={90}
                    step={1}
                    value={chance}
                    onChange={(e) => setChance(Number(e.target.value))}
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[1.5, 2, 3, 5, 10, 20, 50].map((x) => (
                      <button
                        key={x}
                        onClick={() => setChance(Math.max(1, Math.round(HOUSE / x)))}
                        className="btn btn-ghost px-2.5 py-1 text-xs"
                      >
                        x{x}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm">
                  {target ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2">
                      <span className="truncate">
                        Цель: <b>{target.weapon} «{target.name}»</b>
                      </span>
                      <button onClick={() => setTargetId(null)} className="btn btn-ghost px-2.5 py-1 text-xs">
                        Сброс
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/12 px-3 py-4 text-center text-xs text-slate-500">
                      Выберите цель в магазине ниже — кнопка «Цель»
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 eyebrow">добавить скин к ставке</div>
              {ownedInv.length === 0 ? (
                <div className="mt-2 rounded-xl border border-dashed border-white/12 px-3 py-4 text-center text-xs text-slate-500">
                  Инвентарь пуст — купите скин в магазине
                </div>
              ) : (
                <div className="noscroll mt-2 flex gap-2 overflow-x-auto pb-1">
                  {ownedInv.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setInvId(invId === i.id ? null : i.id)}
                      className={`flex w-[112px] shrink-0 flex-col items-center rounded-xl border p-2 transition ${
                        invId === i.id
                          ? "border-orange-400 bg-orange-500/10"
                          : "border-white/10 bg-black/30 hover:border-white/25"
                      }`}
                    >
                      <WeaponArt
                        weapon={i.weapon}
                        color={RARITY_COLORS[i.rarity]?.border ?? "#94a3b8"}
                        className="h-9 w-full"
                      />
                      <span className="mt-1 w-full truncate text-[11px] font-bold">{i.name}</span>
                      <span className="text-[11px] font-black text-amber-300">{fmt(i.price)} G</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorHint ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">
              {errorHint}
            </div>
          ) : null}

          <button
            onClick={doUpgrade}
            disabled={busy || waiting || Boolean(errorHint) || stake <= 0}
            className="btn btn-primary mt-4 w-full py-4 text-lg"
          >
            {waiting ? "ПРОВЕРКА СТАВКИ…" : busy ? "КРУТИМ…" : `АПГРЕЙД · x${multiplier || 0} · ${effChance}%`}
          </button>

          {!me && !loading ? (
            <p className="mt-3 text-center text-sm text-slate-400">
              <Link href="/login" className="font-bold text-orange-400 underline underline-offset-4">
                Войдите
              </Link>{" "}
              — и пополните баланс от 50 G, чтобы играть
            </p>
          ) : null}
        </section>

        {/* ------- SHOP ------- */}
        <section className="panel p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">каталог</div>
              <h2 className="display mt-1 text-2xl sm:text-3xl">
                МАГАЗИН <span className="grad-brand">СКИНОВ</span>
              </h2>
            </div>
            <div className="relative w-full max-w-xs">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" strokeLinecap="round" />
              </svg>
              <input
                className="input pl-9"
                placeholder="AKR, Karambit, FLOCK…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="noscroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
            {RARITY_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  rarityFilter === r
                    ? "border-orange-400/60 bg-orange-500/15 text-orange-200"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                {r === "all" ? "Все" : (RARITY_COLORS[r]?.label ?? r)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((s) => (
              <SkinCard
                key={s.id}
                weapon={s.weapon}
                name={s.name}
                rarity={s.rarity}
                price={s.price}
                selected={targetId === s.id}
                footer={
                  <div className="flex gap-1.5">
                    <button onClick={() => buy(s)} className="btn btn-primary flex-1 px-2 py-1.5 text-[11px]">
                      Купить
                    </button>
                    <button
                      onClick={() => {
                        setMode("target");
                        setTargetId(s.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="btn btn-ghost px-2.5 py-1.5 text-[11px]"
                    >
                      Цель
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Ничего не найдено</p>
          ) : null}
        </section>

        <footer className="pb-8 text-center text-xs text-slate-600">
          StandUp — развлекательная площадка апгрейда скинов Standoff 2. Не связана с Axlebolt.
        </footer>
      </main>
    </div>
  );
}
