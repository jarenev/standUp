"use client";

import type { ReactNode } from "react";
import { RARITY_COLORS } from "@/lib/skins-data";
import { fmt } from "@/lib/client";
import WeaponArt from "./WeaponArt";
import Coin from "./Coin";

export default function SkinCard({
  weapon,
  name,
  rarity,
  price,
  selected,
  onClick,
  footer,
  badge,
  compact,
}: {
  weapon: string;
  name: string;
  rarity: string;
  price: number;
  selected?: boolean;
  onClick?: () => void;
  footer?: ReactNode;
  badge?: string;
  compact?: boolean;
}) {
  const c = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

  return (
    <div
      onClick={onClick}
      className={`group lift relative overflow-hidden rounded-2xl border p-3 ${onClick ? "cursor-pointer" : ""}`}
      style={{
        borderColor: selected ? c.border : "rgba(255,255,255,0.08)",
        background: `linear-gradient(180deg, ${c.from}1f, rgba(9,11,17,0.92) 55%)`,
        boxShadow: selected ? `0 0 0 2px ${c.border}, 0 18px 40px -24px ${c.border}` : undefined,
      }}
    >
      {/* верхняя полоска редкости */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }}
      />

      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: c.border }}>
          {c.label}
        </span>
        {badge ? (
          <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-300">
            {badge}
          </span>
        ) : null}
      </div>

      <div
        className={`relative grid place-items-center overflow-hidden rounded-xl ${compact ? "h-16" : "h-24"}`}
        style={{
          background: `radial-gradient(60% 70% at 50% 55%, ${c.from}33, transparent 72%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `repeating-linear-gradient(115deg, ${c.from}14 0 2px, transparent 2px 12px)`,
          }}
        />
        <WeaponArt
          weapon={weapon}
          color={c.border}
          className={`relative z-10 transition-transform duration-300 group-hover:scale-[1.07] ${
            compact ? "h-12 w-[86%]" : "h-16 w-[88%]"
          }`}
        />
      </div>

      <div className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{weapon}</div>
      <div className="truncate text-[13px] font-extrabold text-white">{name}</div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <Coin size={13} />
        <span className="text-sm font-black text-amber-300">{fmt(price)}</span>
      </div>

      {footer ? <div className="mt-2.5">{footer}</div> : null}
    </div>
  );
}
