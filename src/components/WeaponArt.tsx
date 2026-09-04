"use client";

import { useId } from "react";

export type WeaponKind = "rifle" | "sniper" | "pistol" | "smg" | "shotgun" | "lmg" | "knife" | "karambit" | "daggers";

const KNIFE_WORDS = ["bayonet", "butterfly", "kukri", "tanto", "fang", "flip", "scorpion", "mantis", "stick"];

export function weaponKind(weapon: string): WeaponKind {
  const w = weapon.toLowerCase();
  if (w.includes("karambit")) return "karambit";
  if (w.includes("daggers")) return "daggers";
  if (KNIFE_WORDS.some((k) => w.includes(k))) return "knife";
  if (w.includes("awm") || w.includes("m110")) return "sniper";
  if (w.includes("m60")) return "lmg";
  if (w.includes("spas")) return "shotgun";
  if (w.includes("mp5") || w.includes("mp7") || w.includes("mac10") || w.includes("ump")) return "smg";
  if (w.includes("usp") || w.includes("glock") || w.includes("p350") || w.includes("desert")) return "pistol";
  return "rifle";
}

function Shapes({ kind }: { kind: WeaponKind }) {
  switch (kind) {
    case "sniper":
      return (
        <g>
          <rect x="68" y="30" width="52" height="6" rx="3" />
          <rect x="112" y="27" width="8" height="12" rx="2" />
          <rect x="30" y="24" width="46" height="16" rx="4" />
          <rect x="46" y="10" width="34" height="9" rx="4" />
          <rect x="52" y="18" width="4" height="7" />
          <rect x="70" y="18" width="4" height="7" />
          <path d="M8 22h24v22H16l-8-6z" />
          <path d="M34 40h10l-4 16h-9z" />
          <rect x="56" y="40" width="14" height="11" rx="2" />
        </g>
      );
    case "pistol":
      return (
        <g>
          <rect x="42" y="18" width="66" height="13" rx="3" />
          <rect x="46" y="31" width="52" height="6" rx="2" />
          <path d="M44 33h20l-9 27H36z" />
          <path d="M66 37h22v5H70z" />
          <rect x="96" y="20" width="5" height="4" />
        </g>
      );
    case "smg":
      return (
        <g>
          <rect x="60" y="26" width="46" height="7" rx="3" />
          <rect x="28" y="20" width="42" height="16" rx="4" />
          <rect x="44" y="12" width="18" height="7" rx="3" />
          <path d="M6 18h24v20H12l-6-5z" />
          <path d="M32 36h11l-5 18h-9z" />
          <path d="M52 36h13l4 26H54z" />
        </g>
      );
    case "shotgun":
      return (
        <g>
          <rect x="62" y="22" width="58" height="7" rx="3" />
          <rect x="62" y="31" width="58" height="7" rx="3" />
          <rect x="28" y="20" width="38" height="19" rx="4" />
          <rect x="74" y="39" width="26" height="9" rx="4" />
          <path d="M4 16h26v25H12l-8-7z" />
          <path d="M32 39h11l-5 17h-9z" />
        </g>
      );
    case "lmg":
      return (
        <g>
          <rect x="70" y="26" width="50" height="8" rx="3" />
          <rect x="24" y="18" width="50" height="22" rx="5" />
          <rect x="46" y="10" width="26" height="7" rx="3" />
          <path d="M4 18h22v24H10l-6-6z" />
          <path d="M30 40h12l-5 18h-10z" />
          <path d="M52 40h26v16H52z" opacity="0.85" />
          <path d="M96 34h6l10 22h-8z" />
        </g>
      );
    case "knife":
      return (
        <g>
          <path d="M14 44 84 14l30 12-30 16z" />
          <rect x="12" y="40" width="14" height="12" rx="4" />
          <path d="M84 14 74 34l40-8z" opacity="0.65" />
        </g>
      );
    case "karambit":
      return (
        <g>
          <path d="M74 16 A48 48 0 0 1 114 62 L98 56 A33 33 0 0 0 70 28 Z" />
          <path d="M74 14 L62 34 L36 50 L28 36 Z" />
          <circle cx="20" cy="46" r="11" fill="none" strokeWidth="7" stroke="currentColor" />
        </g>
      );
    case "daggers":
      return (
        <g>
          <path d="M14 26 80 10l24 8-24 10z" />
          <rect x="8" y="20" width="14" height="11" rx="4" />
          <path d="M14 54 80 38l24 8-24 10z" />
          <rect x="8" y="48" width="14" height="11" rx="4" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="66" y="27" width="48" height="7" rx="3" />
          <rect x="26" y="20" width="44" height="15" rx="4" />
          <rect x="62" y="22" width="26" height="10" rx="3" opacity="0.9" />
          <rect x="42" y="12" width="20" height="7" rx="3" />
          <path d="M4 18h22v18H10l-6-4z" />
          <path d="M30 35h11l-5 17h-9z" />
          <path d="M46 35h14c3 9 5 15 6 21H50z" />
        </g>
      );
  }
}

export default function WeaponArt({
  weapon,
  color,
  className = "",
}: {
  weapon: string;
  color: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const kind = weaponKind(weapon);
  return (
    <svg viewBox="0 0 128 70" className={className} style={{ color }} aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="42%" stopColor={color} />
          <stop offset="100%" stopColor="#0b0e15" stopOpacity="0.92" />
        </linearGradient>
        <filter id={`f-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.4" floodColor={color} floodOpacity="0.85" />
        </filter>
      </defs>
      <g fill={`url(#g-${id})`} filter={`url(#f-${id})`}>
        <Shapes kind={kind} />
      </g>
    </svg>
  );
}
