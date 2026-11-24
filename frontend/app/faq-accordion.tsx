"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line dark:divide-night-line dark:border-night-line">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-trigger-${idx}`;

        return (
          <div
            key={item.question}
            className={`px-4 transition-colors sm:px-5 ${
              isOpen ? "bg-accent-wash/75 dark:bg-[#141c36]" : ""
            }`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="group flex min-h-[56px] w-full items-center justify-between gap-6 py-5 text-left transition-colors"
              >
                <span
                  className={`text-base font-medium tracking-tight transition-colors sm:text-lg ${
                    isOpen
                      ? "text-accent-deep dark:text-accent-bright"
                      : "text-ink group-hover:text-accent dark:text-night-ink dark:group-hover:text-accent-bright"
                  }`}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control border transition-colors ${
                    isOpen
                      ? "border-accent bg-accent text-cta-text dark:border-accent-bright dark:bg-accent-bright dark:text-night"
                      : "border-line text-ink-soft group-hover:border-accent/40 group-hover:text-accent dark:border-night-line dark:text-night-ink-soft dark:group-hover:border-accent-bright/40 dark:group-hover:text-accent-bright"
                  }`}
                >
                  <Plus
                    size={16}
                    strokeWidth={1.75}
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[68ch] pb-6 text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-[15px]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
