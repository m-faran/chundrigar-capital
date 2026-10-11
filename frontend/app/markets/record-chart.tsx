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
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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
    const cw = Math.max(2, (plotW / slice.length) * 0.65);

    return { slice, x, y, ticks, dates, candle, cw };
  }, [bars, rangeKey]);

  const activeBar = hoverIdx !== null && view ? view.slice[hoverIdx] ?? null : null;

  const fmtNum = (v: number) =>
    v >= 1000
      ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : v.toFixed(2);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
        {activeBar ? (
          <div className="flex flex-wrap items-baseline gap-2.5 text-xs">
            <span className="font-mono font-medium text-ink dark:text-night-ink">
              {activeBar.date}
            </span>
            <span className="t-figs text-ink-soft dark:text-night-ink-soft">
              O: <strong className="font-medium text-ink dark:text-night-ink">{fmtNum(activeBar.open)}</strong>
            </span>
            <span className="t-figs text-ink-soft dark:text-night-ink-soft">
              H: <strong className="font-medium text-ink dark:text-night-ink">{fmtNum(activeBar.high)}</strong>
            </span>
            <span className="t-figs text-ink-soft dark:text-night-ink-soft">
              L: <strong className="font-medium text-ink dark:text-night-ink">{fmtNum(activeBar.low)}</strong>
            </span>
            <span className="t-figs text-ink-soft dark:text-night-ink-soft">
              C: <strong className="font-medium text-ink dark:text-night-ink">{fmtNum(activeBar.close)}</strong>
            </span>
            {(() => {
              const diff = activeBar.close - activeBar.open;
              const pct = activeBar.open ? ((diff / activeBar.open) * 100).toFixed(2) : "0.00";
              const isUp = diff >= 0;
              return (
                <span
                  className={`t-figs font-medium ${
                    isUp
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isUp ? `+${pct}%` : `${pct}%`}
                </span>
              );
            })()}
          </div>
        ) : (
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
            Price record · daily closes
          </p>
        )}
        <div className="flex gap-1" role="tablist" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === rangeKey}
              onClick={() => {
                setRangeKey(r.key);
                setHoverIdx(null);
              }}
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
        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full cursor-crosshair touch-none select-none"
            role="img"
            aria-label={`Daily price chart, last ${view.slice.length} trading days`}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * W;
              const plotW = W - PAD_L - PAD_R;
              if (relX < PAD_L || relX > W - PAD_R) {
                setHoverIdx(null);
                return;
              }
              const frac = (relX - PAD_L) / plotW;
              const idx = Math.max(
                0,
                Math.min(view.slice.length - 1, Math.floor(frac * view.slice.length))
              );
              setHoverIdx(idx);
            }}
            onPointerLeave={() => setHoverIdx(null)}
            onTouchCancel={() => setHoverIdx(null)}
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
                textAnchor={
                  i === 0 ? "start" : i === view.dates.length - 1 ? "end" : "middle"
                }
                className="fill-[#55575f] dark:fill-[#a1a3ab] font-mono text-[10px]"
              >
                {d.label}
              </text>
            ))}

            {/* scrub crosshair */}
            {hoverIdx !== null && (
              <line
                x1={view.x(hoverIdx)}
                x2={view.x(hoverIdx)}
                y1={PAD_T}
                y2={H - PAD_B}
                className="stroke-[#17181c] dark:stroke-[#ececee]"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            )}

            {view.candle
              ? view.slice.map((b, i) => {
                  const up = b.close >= b.open;
                  const cx = view.x(i);
                  const bw = view.cw;
                  const top = view.y(Math.max(b.open, b.close));
                  const bot = view.y(Math.min(b.open, b.close));
                  const isHovered = hoverIdx === i;
                  return (
                    <g key={b.date + i} opacity={hoverIdx === null || isHovered ? 1 : 0.6}>
                      <title>{`${b.date}: O ${b.open} · H ${b.high} · L ${b.low} · C ${b.close}`}</title>
                      <line
                        x1={cx}
                        x2={cx}
                        y1={view.y(b.high)}
                        y2={view.y(b.low)}
                        className={up ? "stroke-[#16a34a] dark:stroke-[#4ade80]" : "stroke-[#dc2626] dark:stroke-[#f87171]"}
                        strokeWidth="1"
                      />
                      <rect
                        x={cx - bw / 2}
                        y={top}
                        width={bw}
                        height={Math.max(1.5, bot - top)}
                        className={
                          up
                            ? "fill-[#16a34a] stroke-[#16a34a] dark:fill-[#4ade80] dark:stroke-[#4ade80]"
                            : "fill-[#dc2626] stroke-[#dc2626] dark:fill-[#f87171] dark:stroke-[#f87171]"
                        }
                        strokeWidth="1"
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

            {/* active scrub dot on close */}
            {hoverIdx !== null && activeBar && (
              <circle
                cx={view.x(hoverIdx)}
                cy={view.y(activeBar.close)}
                r="3"
                className={
                  activeBar.close >= activeBar.open
                    ? "fill-[#16a34a] stroke-paper dark:fill-[#4ade80] dark:stroke-night"
                    : "fill-[#dc2626] stroke-paper dark:fill-[#f87171] dark:stroke-night"
                }
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-soft dark:text-night-ink-soft">
        Candles through the 3-month window; longer ranges draw the close line.
        Solid green indicates days closed higher, solid red indicates lower. Hover or drag across the chart to inspect daily figures.
      </p>
    </div>
  );
}
