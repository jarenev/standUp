"use client";

import { useEffect, useState } from "react";
import { fmt, getJson } from "@/lib/client";

type FeedItem = {
  id: number;
  login: string;
  avatarUrl: string;
  multiplier: number;
  win: boolean;
  payout: number;
  bet: number;
  target: string | null;
};

export default function LiveFeed({ refreshKey }: { refreshKey: number }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getJson<{ feed: FeedItem[] }>("/api/feed")
        .then((d) => alive && setFeed(d.feed))
        .catch(() => {});
    void load();
    const t = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [refreshKey]);

  if (!feed.length) return null;

  return (
    <div className="panel flex items-center gap-3 overflow-hidden p-2.5">
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-500/12 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">Live</span>
      </div>

      <div className="noscroll flex gap-2 overflow-x-auto">
        {feed.map((f) => (
          <div
            key={f.id}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 ${
              f.win ? "border-green-400/25 bg-green-500/[0.07]" : "border-white/8 bg-white/[0.03]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.avatarUrl} alt="" className="h-6 w-6 rounded-md object-cover" />
            <span className="max-w-[90px] truncate text-[11px] font-bold text-slate-300">{f.login}</span>
            <span className={`text-[11px] font-black ${f.win ? "text-green-400" : "text-slate-500"}`}>
              x{f.multiplier}
            </span>
            <span className={`text-[11px] font-black ${f.win ? "text-amber-300" : "text-rose-400"}`}>
              {f.win ? `+${fmt(f.payout || f.bet * f.multiplier)}` : "проигрыш"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
