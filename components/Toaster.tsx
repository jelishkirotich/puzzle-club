"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Tone = "good" | "bad" | "plain";
type Toast = { id: number; text: string; tone: Tone };

const ToastContext = createContext<(text: string, tone?: Tone) => void>(
  () => {}
);

export function useToast() {
  return useContext(ToastContext);
}

const tones: Record<Tone, string> = {
  good: "bg-forest-soft text-paper",
  bad: "bg-clay text-paper",
  plain: "bg-ink text-cream",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((text: string, tone: Tone = "plain") => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current.slice(-2), { id, text, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-in rounded-full px-5 py-3 text-[15px] font-bold shadow-lg ${tones[toast.tone]}`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}