"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { api, useMe } from "@/lib/client";

export default function LoginPage() {
  const router = useRouter();
  const { me, loading } = useMe();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await api<{ isAdmin: boolean }>(
        tab === "login" ? "/api/auth/login" : "/api/auth/register",
        { login, password },
      );
      router.push(res.isAdmin ? "/admin" : "/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader me={me} loading={loading} />

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2 md:items-center">
        <div className="hidden md:block">
          <div className="eyebrow">standoff 2 upgrade zone</div>
          <h1 className="display mt-2 text-5xl">
            КРУТИ <span className="grad-brand">ШКАЛУ</span>
            <br />
            ЗАБИРАЙ СКИН
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Апгрейд с настраиваемым шансом и иксами, магазин из 70+ скинов, мгновенная продажа и вывод голды в игру.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["90%", "макс. шанс"],
              ["50 G", "мин. депозит"],
              ["20%", "комиссию кроем"],
            ].map(([a, b]) => (
              <div key={b} className="panel-tight p-3 text-center">
                <div className="text-xl font-black text-orange-400">{a}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6 sm:p-7">
          <div className="eyebrow">аккаунт</div>
          <h2 className="display mt-1 text-2xl">
            {tab === "login" ? "Вход в" : "Регистрация в"} Stand<span className="grad-brand">Up</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">Указывайте свой ник из игры Standoff 2.</p>

          <div className="seg mt-5 w-full">
            <button data-active={tab === "login"} onClick={() => setTab("login")} className="flex-1">
              Войти
            </button>
            <button data-active={tab === "register"} onClick={() => setTab("register")} className="flex-1">
              Создать аккаунт
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="eyebrow">логин (ник в игре)</label>
              <input className="input mt-1.5" placeholder="NickName" value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
            <div>
              <label className="eyebrow">пароль</label>
              <input
                className="input mt-1.5"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300">
                {error}
              </div>
            ) : null}
            <button onClick={submit} disabled={busy} className="btn btn-primary w-full py-3.5 text-base">
              {busy ? "…" : tab === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
            <p className="text-center text-[11px] text-slate-500">
              Продолжая, вы подтверждаете, что вам есть 18 лет и это развлекательный сервис.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
