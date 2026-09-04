"use client";

import { useEffect } from "react";

export type ToastMsg = { text: string; ok: boolean };

export default function Toast({ msg, onClose }: { msg: ToastMsg | null; onClose: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
      <div
        className={`pop-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
          msg.ok
            ? "border-green-400/40 bg-green-500/15 text-green-200"
            : "border-red-400/40 bg-red-500/15 text-red-200"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
            msg.ok ? "bg-green-500/25" : "bg-red-500/25"
          }`}
        >
          {msg.ok ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          )}
        </span>
        <span className="text-sm font-bold">{msg.text}</span>
        <button onClick={onClose} className="ml-auto text-white/50 hover:text-white" aria-label="Закрыть">
          ✕
        </button>
      </div>
    </div>
  );
}
