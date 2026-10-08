"use client";

import { useMemo, useState } from "react";

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const RANGES = [
  { key: "1M", bars: 22 },
  { key: "3M", bars: 66 },
  { key: "6M", bars: 132 },
  { key: "1Y", bars: 248 },
  { key: "ALL", bars: 380 },
] as const;

const W = 720;
const H = 300;
const PAD_L = 8;
const PAD_R = 64;
const PAD_T = 14;
const PAD_B = 26;

export function RecordChart({ bars: newestFirst }: { bars: Bar[] }) {
  const bars = useMemo(() => [...newestFirst].reverse(), [newestFirst]);
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("3M");

  const view = useMemo(() => {
    const n = RANGES.find((r) => r.key === rangeKey)?.bars ?? 66;
    const slice = bars.slice(-n);
    if (slice.length === 0) return null;

    const lows = slice.map((b) => b.low);
    const highs = slice.map((b) => b.high);
    let min = Math.min(...lows);
    let max = Math.max(...highs);
    const pad = (max - min) * 0.06 || max * 0.02;
    min -= pad;
    max += pad;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const x = (i: number) => PAD_L + (plotW * (i + 0.5)) / slice.length;
    const y = (v: number) => PAD_T + plotH - (plotH * (v - min)) / (max - min);

    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const v = min + ((max - min) * i) / 4;
      ticks.push({ v, y: y(v) });
    }

    const dateCount = Math.min(5, slice.length);
    const dates = Array.from({ length: dateCount }, (_, k) => {
      const i = Math.round((k * (slice.length - 1)) / Math.max(1, dateCount - 1));
      return { x: x(i), label: slice[i].date.slice(2).replace(/^\d\d-/, "") };
    });

    const candle = slice.length <= 70;
    const cw = Math.max(1.6, (plotW / slice.length) * 0.62);

    return { slice, x, y, ticks, dates, candle, cw };
  }, [bars, rangeKey]);

  const fmtNum = (v: number) =>
    v >= 1000
      ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : v.toFixed(2);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
          Price record · daily closes
        </p>
        <div className="flex gap-1" role="tablist" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === rangeKey}
              onClick={() => setRangeKey(r.key)}
              className={`t-figs relative rounded-control px-2.5 py-1 text-xs transition-colors after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] ${
                r.key === rangeKey
                  ? "bg-ink text-paper dark:bg-night-ink dark:text-night"
                  : "bg-transparent text-ink-soft hover:bg-accent-wash hover:text-ink dark:text-night-ink-soft dark:hover:bg-night-wash dark:hover:text-night-ink"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      {view && (
        <div className="mt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full min-w-[420px]"
            role="img"
            aria-label={`Daily price chart, last ${view.slice.length} trading days`}
          >
            {/* grid: quiet hairlines, ink at 7% */}
            {view.ticks.map((t, i) => (
              <g key={i}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={t.y}
                  y2={t.y}
                  className="stroke-[#17181c] dark:stroke-[#ececee]"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                />
                <text
                  x={W - PAD_R + 6}
                  y={t.y + 3.2}
                  className="fill-[#55575f] dark:fill-[#a1a3ab] font-mono text-[10px]"
                >
                  {fmtNum(t.v)}
                </text>
              </g>
            ))}

            {view.dates.map((d, i) => (
              <text
                key={i}
                x={d.x}
                y={H - 8}
                textAnchor="middle"
                className="fill-[#55575f] dark:fill-[#a1a3ab] font-mono text-[10px]"
              >
                {d.label}
              </text>
            ))}

            {view.candle
              ? view.slice.map((b, i) => {
                  const up = b.close >= b.open;
                  const cx = view.x(i);
                  const bw = view.cw;
                  const top = view.y(Math.max(b.open, b.close));
                  const bot = view.y(Math.min(b.open, b.close));
                  return (
                    <g key={b.date + i}>
                      <title>{`${b.date}: O ${b.open} · H ${b.high} · L ${b.low} · C ${b.close}`}</title>
                      <line
                        x1={cx}
                        x2={cx}
                        y1={view.y(b.high)}
                        y2={view.y(b.low)}
                        className={up ? "stroke-[#17181c] dark:stroke-[#ececee]" : "stroke-[#2148c0] dark:stroke-[#93a8ff]"}
                        strokeWidth="0.9"
                      />
                      <rect
                        x={cx - bw / 2}
                        y={top}
                        width={bw}
                        height={Math.max(1, bot - top)}
                        className={
                          up
                            ? "fill-[#fbfaf7] stroke-[#17181c] dark:fill-[#101114] dark:stroke-[#ececee]"
                            : "fill-[#2148c0] stroke-[#2148c0] dark:fill-[#93a8ff] dark:stroke-[#93a8ff]"
                        }
                        strokeWidth="0.9"
                      />
                    </g>
                  );
                })
              : (() => {
                  const pts = view.slice
                    .map((b, i) => `${view.x(i).toFixed(1)},${view.y(b.close).toFixed(1)}`)
                    .join(" ");
                  const last = view.slice[view.slice.length - 1];
                  return (
                    <g>
                      {view.slice.map((b, i) => (
                        <title key={b.date + i}>{`${b.date}: close ${b.close}`}</title>
                      ))}
                      <polyline
                        points={pts}
                        fill="none"
                        className="stroke-[#17181c] dark:stroke-[#ececee]"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={PAD_L}
                        x2={W - PAD_R}
                        y1={view.y(last.close)}
                        y2={view.y(last.close)}
                        className="stroke-[#17181c] dark:stroke-[#ececee]"
                        strokeOpacity="0.35"
                        strokeWidth="0.7"
                        strokeDasharray="3 4"
                      />
                      <circle
                        cx={view.x(view.slice.length - 1)}
                        cy={view.y(last.close)}
                        r="2.4"
                        className="fill-[#17181c] dark:fill-[#ececee]"
                      />
                    </g>
                  );
                })()}
          </svg>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-soft dark:text-night-ink-soft">
        Candles through the 3-month window; longer ranges draw the close line.
        Days closed higher print hollow, lower print in the accent.
      </p>
    </div>
  );
}
