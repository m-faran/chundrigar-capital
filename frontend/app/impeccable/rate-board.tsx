"use client";

import { useCallback, useEffect, useState } from "react";

type FxResponse = { pair: string; rate: number } | { error: string };
type KseResponse = { data: string[] } | { error: string };

type RowState = "loading" | "error" | "ok";

function usePulled<T>(path: string) {
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

  return { state, value, pulledAt, pull };
}

export function FxRate() {
  const { state, value, pulledAt } = usePulled<FxResponse>("/api/fx");
  const rate = state === "ok" && value && "rate" in value ? value.rate : null;

  return (
    <span className={`cc-board-value cc-board-${state}`}>
      <span className="cc-mono">{rate == null ? "·····" : rate.toFixed(2)}</span>
      <em>
        {state === "error"
          ? "feed unreachable — retrying"
          : pulledAt
            ? `pulled ${pulledAt}`
            : "pulling…"}
      </em>
    </span>
  );
}

export function KseConstituents() {
  const { state, value, pull } = usePulled<KseResponse>("/api/kse100");
  const symbols =
    state === "ok" && value && "data" in value ? value.data : null;

  return (
    <span className={`cc-board-value cc-board-kse cc-board-${state}`}>
      <span className="cc-mono">
        {symbols ? `${symbols.length} symbols` : "·····"}
      </span>
      <em className="cc-board-symbols">
        {symbols ? symbols.slice(0, 10).join(" · ") : "KSE100 constituents"}
      </em>
      {state === "error" && (
        <button type="button" className="cc-board-retry" onClick={pull}>
          Retry pull
        </button>
      )}
    </span>
  );
}
