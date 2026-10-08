"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "taste-theme";

/**
 * Manual light/dark switch for the taste routes. The `dark:` variant in
 * taste.css follows a `.dark` class on <html>; this button flips it,
 * persists the choice, and reads back the state the inline bootstrap
 * script (rendered by each taste page before paint) already applied.
 */
export function ThemeToggle() {
  // null = not yet mounted; renders a stable placeholder to avoid hydration drift.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !(dark ?? false);
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // storage unavailable (private mode etc.) — the choice just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark ?? false}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="t-figs inline-flex min-h-[44px] items-center gap-1.5 rounded-control border border-line bg-transparent px-3 py-1.5 text-[11px] text-ink-soft transition-colors hover:border-ink-soft hover:text-ink dark:border-night-line dark:text-night-ink-soft dark:hover:border-night-ink-soft dark:hover:text-night-ink"
    >
      {dark ? (
        <Sun size={12} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={12} strokeWidth={2} aria-hidden="true" />
      )}
      {dark === null ? "Theme" : dark ? "Light" : "Dark"}
    </button>
  );
}
