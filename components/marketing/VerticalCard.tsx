"use client";

import { motion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface VerticalCardProps {
  emoji: string;
  title: string;
  /** Plain description shown at rest. */
  body: string;
  /** Optional tag chips shown below the body at rest (e.g. "QR ordering"). */
  tags?: string[];
  /** Brand-coloured radial gradient used for the soft glow behind the card. */
  glow: string;
  /** Solid brand colour. */
  accent: string;
  /** Growth bullets shown on hover — each carries a relevant emoji icon. */
  points: { icon: string; text: string }[];
}

// ── Variants ────────────────────────────────────────────────────

const glowVariants: Variants = {
  rest:  { opacity: 0 },
  hover: { opacity: 0.65, transition: { duration: 0.3, ease: EASE } },
};

const bodyVariants: Variants = {
  rest:  { opacity: 1, transition: { duration: 0.3, delay: 0.15, ease: EASE } },
  hover: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
};

const pointsListVariants: Variants = {
  rest:  { opacity: 0, transition: { duration: 0.15 } },
  hover: { opacity: 1, transition: { delay: 0.2, staggerChildren: 0.06 } },
};

const pointItemVariants: Variants = {
  rest:  { opacity: 0, x: -8 },
  hover: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

// ── Component ───────────────────────────────────────────────────

export function VerticalCard({
  emoji,
  title,
  body,
  tags,
  glow,
  accent,
  points,
}: VerticalCardProps) {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      tabIndex={0}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur outline-none transition-colors hover:border-[color:var(--accent)]/40 focus-visible:border-[color:var(--accent)]/60"
      style={{ "--accent": accent } as CSSProperties}
    >
      {/* Brand-coloured glow halo */}
      <motion.div
        className="pointer-events-none absolute -inset-px -z-10 rounded-2xl blur-2xl"
        style={{ background: glow }}
        variants={glowVariants}
        aria-hidden
      />

      <div className="mb-3 text-3xl">{emoji}</div>
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>

      {/* Body + tags / bullet points — share the same flex-1 area */}
      <div className="relative mt-4 flex-1">

        {/* REST state: body text + optional tag chips */}
        <motion.div
          variants={bodyVariants}
          className="absolute inset-0 flex flex-col gap-3"
        >
          <p className="text-sm leading-relaxed text-white/75">{body}</p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
                  style={{
                    borderColor: `${accent}55`,
                    color: accent,
                    background: `${accent}12`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* HOVER state: staggered bullet points */}
        <motion.ul
          variants={pointsListVariants}
          className="absolute inset-0 space-y-2 overflow-hidden"
        >
          {points.map((point) => (
            <motion.li
              key={point.text}
              variants={pointItemVariants}
              className="flex items-start gap-2.5 text-[13px] font-medium leading-snug text-white"
            >
              <span
                aria-hidden
                className="shrink-0 text-base leading-none"
              >
                {point.icon}
              </span>
              <span>{point.text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}
