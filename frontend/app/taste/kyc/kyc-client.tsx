"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* Identity check for whitelisting: document type, document photos,
   document details, selfie, consent. Files never leave the browser in
   this build (there is no upload endpoint), and the panel says so. */

type DocKey = "cnic" | "passport" | "licence";

const DOCS: { key: DocKey; label: string; meta: string; sides: string[] }[] = [
  { key: "cnic", label: "CNIC", meta: "Front and back", sides: ["Front", "Back"] },
  { key: "passport", label: "Passport", meta: "Photo page", sides: ["Photo page"] },
  { key: "licence", label: "Driver licence", meta: "Front and back", sides: ["Front", "Back"] },
];

const STEPS = ["Document", "Photos", "Details", "Selfie", "Confirm"] as const;

const MAX_BYTES = 10 * 1024 * 1024;

/* Format nudges shown under the number field — recognition instead of
   asking users to remember what each document's number looks like. */
const NUM_HINT: Record<DocKey, string> = {
  cnic: "13 digits — 42101-1234567-1",
  passport: "As printed on the photo page",
  licence: "As printed on the card",
};

/* Typed state (document choice, details, consent) survives a refresh:
   sessionStorage is per-tab, so it clears when the tab closes — matching
   the "stays in this tab" copy. Photos are blob URLs and can't outlive
   the document, so they are never persisted. */
const STORE_KEY = "taste-kyc-draft";

type Shot = { name: string; url: string };
type Shots = Record<string, Shot>;

const blankForm = { name: "", number: "", dob: "", expiry: "" };

export function KycClient() {
  const [step, setStep] = useState(0);
  const [doc, setDoc] = useState<DocKey | null>(null);
  const [shots, setShots] = useState<Shots>({});
  const [form, setForm] = useState(blankForm);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState("");

  /* Move focus to the new step's heading whenever the step (or the
     done screen) changes — without it, advancing unmounts the button
     focus sat on and keyboard/SR users drop back to <body>. Skips the
     initial mount so page load never steals focus. */
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  const docSpec = DOCS.find((d) => d.key === doc) ?? null;
  const photoSides = docSpec ? docSpec.sides : [];
  const today = new Date().toISOString().slice(0, 10);

  /* When validation refuses a step, focus + scroll the alert so the
     message is read where it appears — on the details step it lands at
     the panel top while focus sat on Continue at the bottom. */
  const alertRef = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    if (error) {
      alertRef.current?.focus();
      alertRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [error]);

  /* Restore the draft once after mount — reading sessionStorage during
     the first render would mismatch the server-rendered HTML. Writing
     waits for `restored` state to land: the persist effect runs in the
     same commit as the restore, and with a ref guard it wrote the blank
     initial values over the stored draft before React applied the
     restored ones (StrictMode's second restore pass then read back the
     clobbered copy, losing the details while keeping the document). */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.doc && DOCS.some((x) => x.key === d.doc)) setDoc(d.doc);
        if (d.form && typeof d.form === "object") {
          setForm({ ...blankForm, ...d.form });
        }
        if (d.consent === true) setConsent(true);
      }
    } catch {
      /* private mode or corrupt draft — start blank */
    }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({ doc, form, consent }),
      );
    } catch {
      /* storage full or blocked — draft persistence is best-effort */
    }
  }, [restored, doc, form, consent]);

  const validate = (s: number): string | null => {
    if (s === 0 && !docSpec) return "Pick a document type to continue.";
    if (s === 1 && docSpec) {
      for (const side of docSpec.sides) {
        if (!shots[side]) return `Add the ${side.toLowerCase()} photo.`;
      }
      return null;
    }
    if (s === 2) {
      if (!form.name.trim()) return "Enter the full name as printed on the document.";
      if (!form.number.trim()) return "Enter the document number.";
      if (!form.dob) return "Enter the date of birth.";
      if (!form.expiry) return "Enter the expiry date.";
      const today = new Date().toISOString().slice(0, 10);
      if (form.dob >= today) return "Date of birth can't be in the future.";
      if (form.expiry < today)
        return "That document has expired. Use a current one instead.";
      return null;
    }
    if (s === 3 && !shots["selfie"]) return "Add a selfie to continue.";
    if (s === 4 && !consent) return "Confirm the declaration before submitting.";
    return null;
  };

  const advance = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step === STEPS.length - 1) {
      const n = Math.floor(Math.random() * 1_000_000);
      setRef(`KYC-${String(n).padStart(6, "0")}`);
      setDone(true);
      return;
    }
    setStep(step + 1);
  };

  const onPick = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That file is not an image. Photos only.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That file is over 10 MB. Export a smaller photo.");
      e.target.value = "";
      return;
    }
    setError(null);
    setShots((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key].url);
      return { ...prev, [key]: { name: f.name, url: URL.createObjectURL(f) } };
    });
    e.target.value = "";
  };

  const removeShot = (key: string) => {
    setShots((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key].url);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const reset = () => {
    Object.values(shots).forEach((s) => URL.revokeObjectURL(s.url));
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* storage blocked — nothing to clear */
    }
    setShots({});
    setDoc(null);
    setForm(blankForm);
    setConsent(false);
    setError(null);
    setStep(0);
    setDone(false);
  };

  const field =
    "mt-2 min-h-[44px] w-full rounded-control border border-line bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none dark:border-night-line dark:bg-night dark:text-night-ink dark:focus:border-accent-bright";
  const ghostBtn =
    "inline-flex min-h-[44px] items-center justify-center rounded-control border border-line bg-transparent px-5 text-sm font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft";
  const accentBtn =
    "inline-flex min-h-[44px] items-center justify-center rounded-control bg-accent px-6 text-sm font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep";

  return (
    <section className="mt-10 max-w-2xl rounded-surface border border-line bg-surface p-6 dark:border-night-line dark:bg-night-surface">
      {done ? (
        <div role="status">
          <p className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
            Local reference · {ref}
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-lg font-medium tracking-tight text-ink dark:text-night-ink"
          >
            Staged in this tab.
          </h2>
          <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
            This build has no upload endpoint, so nothing left your device.
            The files are held only in this tab; closing it clears them. The
            whitelist itself is granted from the testnet app.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/taste/markets" className={accentBtn}>
              Back to Markets
            </Link>
            <button type="button" onClick={reset} className={ghostBtn}>
              Start over
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* progress */}
          <div className="flex items-baseline justify-between gap-3">
            <p
              className="t-figs text-xs text-ink-soft dark:text-night-ink-soft"
              role="status"
            >
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
            <p className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
              Identity check
            </p>
          </div>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-accent-wash dark:bg-night-wash"
            aria-hidden="true"
          >
            <div
              className="h-full w-full origin-left bg-accent transition-transform duration-300 dark:bg-accent-bright"
              style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }}
            />
          </div>

          {error && (
            <p
              ref={alertRef}
              role="alert"
              tabIndex={-1}
              className="mt-5 border border-line bg-accent-wash px-4 py-3 text-xs leading-relaxed text-ink dark:border-night-line dark:bg-night-wash dark:text-night-ink"
            >
              {error}
            </p>
          )}

          {/* step 0: document type */}
          {step === 0 && (
            <div className="mt-5">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-medium tracking-tight text-ink dark:text-night-ink"
              >
                Which document?
              </h2>
              <div
                className="mt-4 grid gap-1.5"
                role="group"
                aria-label="Document type"
              >
                {DOCS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    aria-pressed={doc === d.key}
                    onClick={() => {
                      setDoc(d.key);
                      setError(null);
                    }}
                    className={`flex min-h-[44px] items-center justify-between rounded-control border px-4 py-2.5 text-sm transition-colors ${
                      doc === d.key
                        ? "border-accent bg-accent-wash text-ink dark:border-accent-bright dark:bg-night-wash dark:text-night-ink"
                        : "border-line bg-transparent text-ink-soft hover:border-ink-soft dark:border-night-line dark:text-night-ink-soft dark:hover:border-night-ink-soft"
                    }`}
                  >
                    <span className="font-medium">{d.label}</span>
                    <span className="t-figs text-xs">{d.meta}</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
                Photos are plain JPG, PNG or HEIC exports, up to 10 MB each.
              </p>
            </div>
          )}

          {/* step 1: document photos */}
          {step === 1 && docSpec && (
            <div className="mt-5">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-medium tracking-tight text-ink dark:text-night-ink"
              >
                {docSpec.label} photos
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                Lay the document flat, keep every edge in frame, and avoid
                glare from overhead light.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
                This build has no upload endpoint. The files stay in this
                tab — closing it clears them.
              </p>
              <div className="mt-4">
                {docSpec.sides.map((side) => {
                  const shot = shots[side];
                  const id = `k-photo-${side.replace(/\s+/g, "-").toLowerCase()}`;
                  return (
                    <div
                      key={side}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 dark:border-night-line"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {shot && (
                          <img
                            src={shot.url}
                            alt={`${side} preview`}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className="h-12 w-12 shrink-0 rounded-control border border-line object-cover dark:border-night-line"
                          />
                        )}
                        <div className="min-w-0">
                          <label
                            htmlFor={id}
                            className="text-sm font-medium text-ink dark:text-night-ink"
                          >
                            {side}
                          </label>
                          <p
                            aria-live="polite"
                            className="t-figs truncate text-xs text-ink-soft dark:text-night-ink-soft"
                          >
                            {shot ? shot.name : "No file yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id={id}
                          type="file"
                          accept="image/*"
                          className="peer sr-only"
                          onChange={onPick(side)}
                        />
                        <label
                          htmlFor={id}
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-control border border-line bg-transparent px-4 text-sm font-medium text-ink transition-colors hover:border-ink-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft dark:peer-focus-visible:outline-accent-bright"
                        >
                          {shot ? "Replace" : "Choose file"}
                        </label>
                        {shot && (
                          <button
                            type="button"
                            onClick={() => removeShot(side)}
                            className="inline-flex min-h-[44px] items-center rounded-control border border-line bg-transparent px-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink-soft hover:text-ink dark:border-night-line dark:text-night-ink-soft dark:hover:border-night-ink-soft dark:hover:text-night-ink"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* step 2: document details */}
          {step === 2 && (
            <div
              className="mt-5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  advance();
                }
              }}
            >
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-medium tracking-tight text-ink dark:text-night-ink"
              >
                Document details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 sm:col-span-2">
                  <label
                    htmlFor="k-name"
                    className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
                  >
                    Full name, as printed
                  </label>
                  <input
                    id="k-name"
                    value={form.name}
                    autoComplete="name"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={field}
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="k-number"
                    className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
                  >
                    Document number
                  </label>
                  <input
                    id="k-number"
                    value={form.number}
                    spellCheck={false}
                    aria-describedby="k-number-hint"
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className={`${field} t-figs`}
                  />
                  {docSpec && (
                    <p
                      id="k-number-hint"
                      className="mt-1 text-xs text-ink-soft dark:text-night-ink-soft"
                    >
                      {NUM_HINT[docSpec.key]}
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="k-issued"
                    className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
                  >
                    Expiry date
                  </label>
                  <input
                    id="k-issued"
                    type="date"
                    value={form.expiry}
                    min={today}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className={`${field} [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="k-dob"
                    className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
                  >
                    Date of birth
                  </label>
                  <input
                    id="k-dob"
                    type="date"
                    value={form.dob}
                    max={today}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className={`${field} [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* step 3: selfie */}
          {step === 3 && (
            <div className="mt-5">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-medium tracking-tight text-ink dark:text-night-ink"
              >
                Selfie
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                Look straight at the lens with your shoulders in frame, in
                even light, without a hat or sunglasses. One photo is enough.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
                Same rule as the document photos: nothing leaves this tab.
              </p>
              <div className="mt-4">
                {(() => {
                  const shot = shots["selfie"];
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 dark:border-night-line">
                      <div className="flex min-w-0 items-center gap-3">
                        {shot && (
                          <img
                            src={shot.url}
                            alt="Selfie preview"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className="h-12 w-12 shrink-0 rounded-control border border-line object-cover dark:border-night-line"
                          />
                        )}
                        <div className="min-w-0">
                          <label
                            htmlFor="k-selfie"
                            className="text-sm font-medium text-ink dark:text-night-ink"
                          >
                            Selfie photo
                          </label>
                          <p
                            aria-live="polite"
                            className="t-figs truncate text-xs text-ink-soft dark:text-night-ink-soft"
                          >
                            {shot ? shot.name : "No file yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">                          <input
                            id="k-selfie"
                            type="file"
                            accept="image/*"
                            className="peer sr-only"
                            onChange={onPick("selfie")}
                          />
                        <label
                          htmlFor="k-selfie"
                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-control border border-line bg-transparent px-4 text-sm font-medium text-ink transition-colors hover:border-ink-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft dark:peer-focus-visible:outline-accent-bright"
                        >
                          {shot ? "Replace" : "Use camera or file"}
                        </label>
                        {shot && (
                          <button
                            type="button"
                            onClick={() => removeShot("selfie")}
                            className="inline-flex min-h-[44px] items-center rounded-control border border-line bg-transparent px-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink-soft hover:text-ink dark:border-night-line dark:text-night-ink-soft dark:hover:border-night-ink-soft dark:hover:text-night-ink"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* step 4: confirm + consent */}
          {step === 4 && (
            <div className="mt-5">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-lg font-medium tracking-tight text-ink dark:text-night-ink"
              >
                Confirm and submit
              </h2>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-5 text-sm dark:border-night-line">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Document</dt>
                  <dd className="text-right text-ink dark:text-night-ink">
                    {docSpec?.label ?? "n/a"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Full name</dt>
                  <dd className="min-w-0 truncate text-right text-ink dark:text-night-ink">
                    {form.name || "n/a"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Number</dt>
                  <dd className="t-figs text-right text-ink dark:text-night-ink">
                    {form.number || "n/a"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Born</dt>
                  <dd className="t-figs text-right text-ink dark:text-night-ink">
                    {form.dob || "n/a"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Expires</dt>
                  <dd className="t-figs text-right text-ink dark:text-night-ink">
                    {form.expiry || "n/a"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft dark:text-night-ink-soft">Files</dt>
                  <dd className="t-figs text-right text-ink dark:text-night-ink">
                    {[
                      ...photoSides.filter((s) => shots[s]),
                      ...(shots["selfie"] ? ["Selfie"] : []),
                    ].join(" \u00b7 ") || "none"}
                  </dd>
                </div>
              </dl>

              <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-ink dark:text-night-ink">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setError(null);
                  }}
                  className="mt-0.5 size-4 shrink-0 accent-[#2148c0] dark:accent-[#93a8ff]"
                />
                <span>
                  I confirm these documents are mine and the details match
                  them exactly.
                </span>
              </label>

              <p className="mt-4 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
                This build has no upload endpoint. The files stay in this tab.
              </p>
            </div>
          )}

          {/* nav */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 dark:border-night-line">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(step - 1);
                }}
                className={ghostBtn}
              >
                Back
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <button type="button" onClick={advance} className={accentBtn}>
              {step === STEPS.length - 1 ? "Submit" : "Continue"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
