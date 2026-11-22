import Link from "next/link";
import Image from "next/image";

export type HeroVariant =
  | "editorial"
  | "medallion"
  | "marble_bust_a"
  | "marble_bust_b";

const HERO_HEADLINE =
  "Trade the Pakistan Stock Exchange from your crypto wallet";
const HERO_SUBHEADING =
  "Skip brokerage paperwork — verify your CNIC once and trade PSX shares.";

/**
 * Resolves the active hero variant from URL query parameters so all hero
 * concepts can be compared directly via URL (e.g. `/?Editorial`,
 * `/?Medallion`, `/?Marble_bust_A`, `/?Marble_bust_B`).
 */
export function resolveHeroVariant(
  params: Record<string, string | string[] | undefined>
): HeroVariant {
  const keys = Object.keys(params).map((k) => k.toLowerCase());
  const heroParam =
    typeof params.hero === "string" ? params.hero.toLowerCase() : "";

  if (
    keys.includes("marble_bust_b") ||
    keys.includes("monolith_b") ||
    heroParam === "marble_bust_b" ||
    heroParam === "monolith_b"
  ) {
    return "marble_bust_b";
  }

  if (
    keys.includes("marble_bust_a") ||
    keys.includes("marble_bust") ||
    keys.includes("monolith") ||
    heroParam === "marble_bust_a" ||
    heroParam === "marble_bust" ||
    heroParam === "monolith"
  ) {
    return "marble_bust_a";
  }

  if (
    keys.includes("medallion") ||
    heroParam === "medallion"
  ) {
    return "medallion";
  }

  return "editorial";
}

function HeroCtas({
  compact = false,
  centered = false,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${
        centered ? "justify-center" : ""
      } ${compact ? "mt-5" : "mt-8 gap-4"}`}
    >
      <Link
        href="/kyc"
        className={`rounded-control bg-accent font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep ${
          compact ? "px-5 py-2.5 text-sm" : "px-6 py-3"
        }`}
      >
        Verify wallet
      </Link>
      <Link
        href="/markets"
        className={`rounded-control border border-line font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft ${
          compact ? "px-5 py-2.5 text-sm" : "px-6 py-3"
        }`}
      >
        Explore markets
      </Link>
    </div>
  );
}

/**
 * Direction 1 (Montra-inspired): asymmetric editorial split with borderless
 * classical bust illustration on the right.
 */
function EditorialHero() {
  return (
    <section className="grid items-center gap-10 pt-12 md:grid-cols-12 md:gap-8 md:pt-16 lg:pt-20">
      <div className="pb-6 md:col-span-7 md:pb-16 lg:pb-20">
        <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[52px] lg:leading-[1.06]">
          {HERO_HEADLINE}
        </h1>

        <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-soft dark:text-night-ink-soft">
          {HERO_SUBHEADING}
        </p>

        <HeroCtas />
      </div>

      <div className="flex justify-center self-end md:col-span-5 md:justify-end">
        <div className="w-full max-w-[420px] md:max-w-[490px]">
          <Image
            src="/images/hero-editorial-light.png"
            alt="Classical engraved bust draped in cobalt geometric motif"
            width={651}
            height={714}
            priority
            sizes="(max-width: 768px) 90vw, 490px"
            className="block h-auto w-full dark:hidden"
          />
          <Image
            src="/images/hero-editorial-dark.png"
            alt="Classical engraved bust draped in cobalt geometric motif"
            width={651}
            height={711}
            priority
            sizes="(max-width: 768px) 90vw, 490px"
            className="hidden h-auto w-full dark:block"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Direction 2 (a16z-inspired): sovereign minted coin medallion pairing
 * classical ledger relief with Merewether Clock Tower and the PSX portico.
 */
function MedallionHero() {
  return (
    <section className="grid items-center gap-12 py-14 md:grid-cols-12 md:gap-8 md:py-20 lg:py-24">
      <div className="md:col-span-6">
        <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[50px] lg:leading-[1.08]">
          {HERO_HEADLINE}
        </h1>

        <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-soft dark:text-night-ink-soft">
          {HERO_SUBHEADING}
        </p>

        <HeroCtas />
      </div>

      <div className="relative flex items-center justify-center md:col-span-6">
        <div className="relative flex w-full max-w-[440px] items-center justify-center lg:max-w-[500px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 rounded-full border border-line/70 dark:border-night-line/70"
          />
          <Image
            src="/images/hero-medallion-light.png"
            alt="Sovereign minted coin medallion depicting Pakistan Stock Exchange and Karachi landmarks"
            width={696}
            height={696}
            priority
            sizes="(max-width: 768px) 90vw, 500px"
            className="relative z-10 block h-auto w-full drop-shadow-[0_22px_40px_rgba(23,24,28,0.14)] dark:hidden"
          />
          <Image
            src="/images/hero-medallion-dark.png"
            alt="Sovereign minted coin medallion depicting Pakistan Stock Exchange and Karachi landmarks"
            width={666}
            height={666}
            priority
            sizes="(max-width: 768px) 90vw, 500px"
            className="relative z-10 hidden h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.65)] dark:block"
          />
        </div>
      </div>
    </section>
  );
}

function MarbleBustPicture({ className }: { className: string }) {
  return (
    <div className={className}>
      <Image
        src="/images/hero-marble-cobalt-light.png"
        alt="Classical marble bust with cobalt toga, carved neoclassical columns, and Mughal geometric latticework"
        width={532}
        height={684}
        priority
        sizes="(max-width: 768px) 300px, 390px"
        className="block h-auto w-full dark:hidden"
      />
      <Image
        src="/images/hero-marble-cobalt-dark.png"
        alt="Classical marble bust with cobalt toga, carved neoclassical columns, and Mughal geometric latticework"
        width={532}
        height={684}
        priority
        sizes="(max-width: 768px) 300px, 390px"
        className="hidden h-auto w-full dark:block"
      />
    </div>
  );
}

/**
 * Direction 3A (Monolith-inspired): CHUNDRIGAR above & CAPITAL below framing
 * the centered marble bust, with headline, subheading, and CTAs underneath.
 */
function MarbleBustAHero() {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="relative mx-auto flex max-w-[1160px] flex-col items-center">
        <p
          aria-hidden="true"
          className="pointer-events-none select-none text-center text-[13.5vw] font-semibold uppercase leading-[0.84] tracking-[-0.045em] text-ink dark:text-night-ink xl:text-[176px]"
        >
          CHUNDRIGAR
        </p>

        <MarbleBustPicture className="relative z-10 mx-auto -mt-[6.5vw] w-[240px] sm:w-[300px] md:-mt-[92px] md:w-[350px] lg:-mt-[112px] lg:w-[380px]" />

        <p
          aria-hidden="true"
          className="pointer-events-none relative z-0 -mt-[11vw] select-none text-center text-[13.5vw] font-semibold uppercase leading-[0.84] tracking-[0.14em] text-ink dark:text-night-ink sm:-mt-[90px] md:-mt-[112px] lg:-mt-[126px] xl:text-[176px]"
        >
          CAPITAL
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-[62ch] flex-col items-center text-center md:mt-12">
        <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          {HERO_HEADLINE}
        </h1>

        <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-lg">
          {HERO_SUBHEADING}
        </p>

        <HeroCtas centered />
      </div>
    </section>
  );
}

/**
 * Direction 3B: centered headline above the marble bust, with subheading and
 * CTAs positioned directly below the sculpture.
 */
function MarbleBustBHero() {
  return (
    <section className="pt-10 pb-16 md:pt-16 md:pb-24">
      <h1 className="mx-auto max-w-[22ch] text-center text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[50px] lg:leading-[1.08]">
        {HERO_HEADLINE}
      </h1>

      <MarbleBustPicture className="mx-auto mt-8 w-[250px] sm:w-[310px] md:mt-10 md:w-[360px] lg:w-[390px]" />

      <div className="mx-auto mt-8 flex max-w-[54ch] flex-col items-center text-center md:mt-10">
        <p className="text-base leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-lg">
          {HERO_SUBHEADING}
        </p>

        <HeroCtas centered />
      </div>
    </section>
  );
}

export function HeroSection({ variant }: { variant: HeroVariant }) {
  if (variant === "medallion") return <MedallionHero />;
  if (variant === "marble_bust_a") return <MarbleBustAHero />;
  if (variant === "marble_bust_b") return <MarbleBustBHero />;
  return <EditorialHero />;
}

const PREVIEW_LINKS: { key: HeroVariant; label: string; href: string }[] = [
  { key: "editorial", label: "01 Editorial", href: "/?Editorial" },
  { key: "medallion", label: "02 Medallion", href: "/?Medallion" },
  { key: "marble_bust_a", label: "03A Marble Bust", href: "/?Marble_bust_A" },
  { key: "marble_bust_b", label: "03B Marble Bust", href: "/?Marble_bust_B" },
];

export function HeroPreviewSwitcher({ active }: { active: HeroVariant }) {
  return (
    <aside
      aria-label="Hero direction comparison"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-1 rounded-surface border border-line bg-surface/95 p-1.5 shadow-[0_8px_28px_rgba(23,24,28,0.14)] backdrop-blur dark:border-night-line dark:bg-night-surface/95 dark:shadow-[0_8px_28px_rgba(0,0,0,0.6)]">
        <span className="t-figs hidden px-2.5 text-[11px] uppercase tracking-wider text-ink-soft dark:text-night-ink-soft sm:inline">
          Hero
        </span>
        {PREVIEW_LINKS.map((item) => {
          const isCurrent = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`t-figs whitespace-nowrap rounded-control px-3 py-1.5 text-xs transition-colors ${
                isCurrent
                  ? "bg-accent font-medium text-cta-text dark:bg-accent-bright dark:text-night"
                  : "text-ink-soft hover:bg-accent-wash hover:text-ink dark:text-night-ink-soft dark:hover:bg-night-wash dark:hover:text-night-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
