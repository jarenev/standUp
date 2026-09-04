"use client";

import { useEffect, useRef, useState } from "react";

export type Spin = { token: number; landing: number; win: boolean };

function fold(x: number) {
  let v = x;
  for (let i = 0; i < 8; i += 1) {
    if (v > 1) v = 2 - v;
    else if (v < 0) v = -v;
    else break;
  }
  return Math.min(1, Math.max(0, v));
}

export default function UpgradeBar({
  chance,
  speed,
  spin,
  onDone,
  waiting,
}: {
  chance: number;
  speed: "fast" | "slow";
  spin: Spin | null;
  onDone?: (win: boolean) => void;
  waiting?: boolean;
}) {
  const [pos, setPos] = useState(0.5);
  const [state, setState] = useState<"idle" | "spin" | "win" | "lose">("idle");
  const posRef = useRef(0.5);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    if (!spin) return;
    const duration = speed === "slow" ? 5400 : 2700;
    const cycles = speed === "slow" ? 6.5 : 4.5;
    const target = Math.min(0.985, Math.max(0.015, spin.landing));
    const start = posRef.current;
    let amp = start - target;
    if (Math.abs(amp) < 0.4) amp = (start >= target ? 1 : -1) * 0.46;
    const t0 = performance.now();
    setState("spin");

    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / duration);
      const decay = Math.exp(-3.1 * u);
      const value = target + amp * decay * Math.cos(2 * Math.PI * cycles * u);
      setPos(fold(value));
      if (u < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPos(target);
        setState(spin.win ? "win" : "lose");
        onDone?.(spin.win);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin?.token]);

  const greenPct = Math.min(97, Math.max(1, Math.round(chance * 10) / 10));
  const redPct = Math.round((100 - greenPct) * 10) / 10;
  const ticks = Array.from({ length: 49 }, (_, i) => i);
  const spinning = state === "spin";

  return (
    <div className="flex items-stretch gap-3 select-none">
      {/* левая линейка делений */}
      <div className="relative hidden w-9 sm:block">
        {[0, 25, 50, 75, 100].map((v) => (
          <div
            key={v}
            className="absolute right-0 -translate-y-1/2 text-[10px] font-bold text-slate-600"
            style={{ bottom: `${v}%` }}
          >
            {v}
          </div>
        ))}
      </div>

      <div
        className={`relative h-[440px] w-[132px] overflow-hidden rounded-[20px] border transition-all duration-300 ${
          state === "win"
            ? "border-green-400/70 glow-green"
            : state === "lose"
              ? "border-red-400/70 glow-red"
              : "border-white/12"
        }`}
        style={{ background: "#080a10" }}
      >
        {/* красная зона */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center transition-[height] duration-300"
          style={{
            height: `${redPct}%`,
            background:
              "linear-gradient(180deg, rgba(244,63,94,0.95) 0%, rgba(190,18,60,0.86) 55%, rgba(127,29,29,0.8) 100%)",
          }}
        >
          <div className="text-center leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            <div className="text-[22px] font-black text-white">{redPct}%</div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/70">неудача</div>
          </div>
        </div>

        {/* зелёная зона */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center transition-[height] duration-300"
          style={{
            height: `${greenPct}%`,
            background:
              "linear-gradient(0deg, rgba(34,197,94,0.98) 0%, rgba(21,128,61,0.88) 55%, rgba(20,83,45,0.82) 100%)",
          }}
        >
          <div className="text-center leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            <div className="text-[22px] font-black text-white">{greenPct}%</div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/75">удача</div>
          </div>
        </div>

        {/* деления */}
        <div className="pointer-events-none absolute inset-0">
          {ticks.map((i) => (
            <div
              key={i}
              className="absolute left-0 bg-black"
              style={{
                bottom: `${(i / 48) * 100}%`,
                height: i % 6 === 0 ? 2 : 1,
                width: i % 6 === 0 ? "34%" : "18%",
                opacity: i % 6 === 0 ? 0.55 : 0.32,
              }}
            />
          ))}
          {ticks.map((i) => (
            <div
              key={`r${i}`}
              className="absolute right-0 bg-black"
              style={{
                bottom: `${(i / 48) * 100}%`,
                height: i % 6 === 0 ? 2 : 1,
                width: i % 6 === 0 ? "34%" : "18%",
                opacity: i % 6 === 0 ? 0.55 : 0.32,
              }}
            />
          ))}
        </div>

        {/* граница зон */}
        <div
          className="pointer-events-none absolute inset-x-0 h-[2px] bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          style={{ bottom: `${greenPct}%` }}
        />

        {/* блики стекла */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[linear-gradient(105deg,rgba(255,255,255,0.16),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_0_40px_rgba(0,0,0,0.55)]" />

        {/* стрелка-палочка */}
        <div
          className="absolute inset-x-0 z-20"
          style={{
            bottom: `calc(${pos * 100}% - 4px)`,
            filter: spinning ? "drop-shadow(0 0 10px rgba(255,255,255,0.9))" : "none",
          }}
        >
          <div className="relative h-[8px] w-full rounded-sm bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.55)]" />
          <div className="absolute -left-[3px] -top-[7px] h-0 w-0 border-y-[11px] border-l-[13px] border-y-transparent border-l-white" />
          <div className="absolute -right-[3px] -top-[7px] h-0 w-0 border-y-[11px] border-r-[13px] border-y-transparent border-r-white" />
        </div>

        {waiting ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-black/78 backdrop-blur-[2px]">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
              <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-orange-300">
                проверка
                <br />
                ставки
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* правый статус */}
      <div className="flex w-[86px] flex-col justify-between py-1">
        <div className="panel-tight p-2 text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-rose-400">Провал</div>
          <div className="text-sm font-black text-white">{redPct}%</div>
        </div>

        <div
          className={`rounded-xl border p-2 text-center text-[10px] font-black uppercase tracking-widest transition ${
            state === "win"
              ? "border-green-400/50 bg-green-500/15 text-green-300"
              : state === "lose"
                ? "border-red-400/50 bg-red-500/15 text-red-300"
                : "border-white/10 bg-white/5 text-slate-400"
          }`}
        >
          {spinning ? "крутим" : state === "win" ? "успех" : state === "lose" ? "провал" : "готов"}
        </div>

        <div className="panel-tight p-2 text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-green-400">Успех</div>
          <div className="text-sm font-black text-white">{greenPct}%</div>
        </div>
      </div>
    </div>
  );
}
