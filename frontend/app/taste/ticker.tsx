"use client";

import { useCallback, useEffect, useState } from "react";

type Fx = { pair: string; rate: number } | { error: string };
type Kse = { data: string[] } | { error: string };
type RowState = "loading" | "error" | "ok";

function usePull<T>(path: string) {
  const [state, setState] = useState<RowState>("loading");
  const [value, setValue] = useState<T | null>(null);
  const [pulledAt, setPulledAt] = useState<string | null>(null);

  const pull = useCallback(async () => {
    setState((s) => (s === "ok" ? "ok" : "loading"));
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setValue((await res.json()) as T);
      setState("ok");
      setPulledAt(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch {
      setState("error");
    }
  }, [path]);

  useEffect(() => {
    pull();
    const id = setInterval(pull, 60_000);
    return () => clearInterval(id);
  }, [pull]);

  return { state, value, pulledAt };
}

export default function Ticker() {
  const fx = usePull<Fx>("/api/fx");
  const kse = usePull<Kse>("/api/kse100");

  const rate =
    fx.state === "ok" && fx.value && "rate" in fx.value ? fx.value.rate : null;
  const count =
    kse.state === "ok" && kse.value && "data" in kse.value
      ? kse.value.data.length
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-soft dark:text-night-ink-soft">
          USD / PKR
        </span>
        <span className="t-figs text-4xl font-medium text-ink dark:text-night-ink">
          {rate == null ? (
            <span className={fx.state === "error" ? "text-lg" : undefined}>
              {fx.state === "error" ? "unreachable, retrying" : "…"}
            </span>
          ) : (
            rate.toFixed(2)
          )}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-soft dark:text-night-ink-soft">
          KSE 100
        </span>
        <span className="t-figs text-2xl font-medium text-ink dark:text-night-ink">
          {count == null ? (
            <span className={kse.state === "error" ? "text-base" : undefined}>
              {kse.state === "error" ? "unreachable, retrying" : "…"}
            </span>
          ) : (
            `${count} symbols`
          )}
        </span>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-soft dark:text-night-ink-soft">
        Live quote · pulled {fx.pulledAt ?? "just now"} PKT
      </p>
    </div>
  );
}
