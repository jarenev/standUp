"use client";

import { useCallback, useEffect, useState } from "react";

export type Me = {
  id: number;
  login: string;
  avatarUrl: string;
  balance: number;
  isAdmin: boolean;
};

export async function api<T = unknown>(url: string, body?: unknown, method = "POST"): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined && method === "POST" ? "GET" : method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data?.error || "Ошибка запроса");
  return data;
}

export async function getJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data?.error || "Ошибка запроса");
  return data;
}

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getJson<{ user: Me | null }>("/api/auth/me");
      setMe(data.user);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { me, loading, refresh, setMe };
}

export function fmt(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    Math.round(value * 100) / 100,
  );
}
