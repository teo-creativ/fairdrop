"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastInput = {
  kind: "success" | "error";
  title: string;
  message?: string;
  /** Lien vers l'élément concerné (ex. `/drops/3` après une création de drop). */
  link?: { href: string; label: string };
};

type Toast = ToastInput & { id: number };

const AUTO_DISMISS_MS = { success: 8000, error: 12000 } as const;

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/** Toast maison (pas de lib externe) — monté une seule fois dans <Providers>. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...toast, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS[toast.kind]),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-[min(24rem,calc(100vw-2rem))]"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isSuccess = toast.kind === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`bg-card border rounded-2xl p-4 shadow-lg shadow-black/50 flex gap-3 ${
        isSuccess ? "border-success/40" : "border-danger/40"
      }`}
    >
      <span className={`${isSuccess ? "text-success" : "text-danger"} text-lg leading-6`}>
        {isSuccess ? "✓" : "✕"}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-white">{toast.title}</p>
        {toast.message && <p className="text-muted text-sm mt-1 break-words">{toast.message}</p>}
        {toast.link && (
          <Link
            href={toast.link.href}
            onClick={onDismiss}
            className="inline-block mt-3 bg-gradient-to-r from-accent to-accent-light text-white text-sm rounded-pill px-4 py-1.5"
          >
            {toast.link.label}
          </Link>
        )}
      </div>

      <button onClick={onDismiss} aria-label="Dismiss" className="text-muted hover:text-white self-start">
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used inside <ToastProvider>");
  return push;
}
