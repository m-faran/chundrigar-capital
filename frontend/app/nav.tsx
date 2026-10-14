"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "./theme-toggle";

export function TasteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isOverview = pathname === "/";
  const isMarkets = pathname.startsWith("/markets");
  const isKyc = pathname.startsWith("/kyc");

  const navItemClass = (active: boolean) =>
    `inline-flex min-h-[44px] items-center rounded-control px-3 py-2 text-sm transition-colors ${
      active
        ? "font-medium text-ink dark:text-night-ink"
        : "text-ink-soft hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur dark:border-night-line dark:bg-night/95">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-5 md:gap-6 md:px-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink"
        >
          Chundrigar Capital
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main"
          className="ml-2 hidden items-center gap-1 text-sm md:flex"
        >
          <Link
            href="/"
            aria-current={isOverview ? "page" : undefined}
            className={navItemClass(isOverview)}
          >
            Overview
          </Link>
          <Link
            href="/markets"
            aria-current={isMarkets ? "page" : undefined}
            className={navItemClass(isMarkets)}
          >
            Markets
          </Link>
          <Link
            href="/kyc"
            aria-current={isKyc ? "page" : undefined}
            className={navItemClass(isKyc)}
          >
            Verify
          </Link>
          {isOverview && (
            <>
              <a
                href="#t-how"
                className={navItemClass(false)}
              >
                How it works
              </a>
              <a
                href="#t-trust"
                className={navItemClass(false)}
              >
                Trust &amp; safety
              </a>
            </>
          )}
        </nav>

        {/* Status pill (desktop) */}
        <span className="t-figs ml-auto hidden rounded-control border border-line px-2.5 py-1 text-[11px] text-ink-soft dark:border-night-line dark:text-night-ink-soft lg:inline-block">
          Base Sepolia · TESTNET
        </span>

        {/* Theme toggle */}
        <div className="ml-auto md:ml-0">
          <ThemeToggle />
        </div>

        {/* RainbowKit Wallet Connect (desktop) */}
        <div className="hidden shrink-0 items-center sm:flex">
          <ConnectButton showBalance={false} />
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="taste-mobile-nav"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control border border-line bg-transparent text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft md:hidden"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {open && (
        <div
          id="taste-mobile-nav"
          className="border-b border-line bg-surface px-5 py-4 dark:border-night-line dark:bg-night-surface md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <Link
              href="/"
              aria-current={isOverview ? "page" : undefined}
              className={`flex min-h-[44px] items-center rounded-control px-3 py-2 text-base ${
                isOverview
                  ? "bg-accent-wash font-semibold text-accent dark:bg-night-wash dark:text-accent-bright"
                  : "text-ink hover:bg-accent-wash/50 dark:text-night-ink dark:hover:bg-night-wash/50"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/markets"
              aria-current={isMarkets ? "page" : undefined}
              className={`flex min-h-[44px] items-center rounded-control px-3 py-2 text-base ${
                isMarkets
                  ? "bg-accent-wash font-semibold text-accent dark:bg-night-wash dark:text-accent-bright"
                  : "text-ink hover:bg-accent-wash/50 dark:text-night-ink dark:hover:bg-night-wash/50"
              }`}
            >
              Markets
            </Link>
            <Link
              href="/kyc"
              aria-current={isKyc ? "page" : undefined}
              className={`flex min-h-[44px] items-center rounded-control px-3 py-2 text-base ${
                isKyc
                  ? "bg-accent-wash font-semibold text-accent dark:bg-night-wash dark:text-accent-bright"
                  : "text-ink hover:bg-accent-wash/50 dark:text-night-ink dark:hover:bg-night-wash/50"
              }`}
            >
              Verify identity
            </Link>
            {isOverview && (
              <>
                <a
                  href="#t-how"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-control px-3 py-2 text-base text-ink-soft hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                >
                  How it works
                </a>
                <a
                  href="#t-trust"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-control px-3 py-2 text-base text-ink-soft hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                >
                  Trust &amp; safety
                </a>
              </>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 dark:border-night-line">
              <span className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
                Base Sepolia · TESTNET
              </span>
              <ConnectButton showBalance={false} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
