"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fmt, type Me } from "@/lib/client";
import Coin from "./Coin";

const NAV = [
  { href: "/", label: "Апгрейд" },
  { href: "/profile", label: "Профиль" },
  { href: "/topup", label: "Пополнить" },
];

export default function SiteHeader({ me, loading }: { me: Me | null; loading?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#06070c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-500 shadow-[0_10px_26px_-12px_rgba(249,115,22,0.9)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/85" fill="currentColor" aria-hidden>
              <path d="M12 2 4 10h5v12h6V10h5z" />
            </svg>
          </span>
          <span className="text-[22px] font-black leading-none tracking-tight">
            Stand<span className="grad-brand">Up</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">upgrade zone</span>
          </span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 sm:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-xl px-3.5 py-2 text-[13px] font-bold transition ${
                  active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          {me?.isAdmin ? (
            <Link
              href="/admin"
              className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-3.5 py-2 text-[13px] font-bold text-orange-300 transition hover:bg-orange-500/20"
            >
              Админ
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-xl bg-white/5" />
          ) : me ? (
            <>
              <Link
                href="/topup"
                className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-gradient-to-b from-amber-400/15 to-amber-500/5 px-3 py-2 text-sm font-black text-amber-200 transition hover:border-amber-400/50"
              >
                <Coin size={15} />
                {fmt(me.balance)}
                <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-400 text-[14px] leading-none text-black">
                  +
                </span>
              </Link>
              <Link href="/profile" className="flex items-center gap-2 rounded-xl p-0.5 pr-2 transition hover:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={me.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg border border-white/10 object-cover"
                />
                <span className="hidden max-w-[110px] truncate text-sm font-bold sm:block">{me.login}</span>
              </Link>
              <button
                onClick={logout}
                title="Выйти"
                className="btn btn-ghost h-9 w-9 p-0 text-slate-400"
                aria-label="Выйти"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
                </svg>
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary px-5 py-2.5 text-sm">
              Войти
            </Link>
          )}
        </div>
      </div>

      {/* мобильная навигация */}
      <div className="flex gap-1 overflow-x-auto border-t border-white/8 px-3 py-2 sm:hidden">
        {NAV.concat(me?.isAdmin ? [{ href: "/admin", label: "Админ" }] : []).map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
              pathname === n.href ? "bg-white/10 text-white" : "text-slate-400"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
