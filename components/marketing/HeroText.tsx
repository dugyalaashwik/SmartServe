"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { y: 24, opacity: 0, filter: "blur(8px)" },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT_EXPO },
  },
};

/**
 * Hero text is split into Top (badge + headline) and Bottom (subtitle + CTAs)
 * so the 3D logo + orbit get the middle of the viewport unobstructed.
 */
export function HeroTextTop() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="pointer-events-none relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
    >
      <motion.span
        variants={item}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#5fc3e8] backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-[#e8533f] shadow-[0_0_12px_#e8533f]" />
        AI Assistant
      </motion.span>

      <motion.h1
        variants={item}
        className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl"
      >
        Every call, <span className="text-[#5fc3e8]">answered.</span>
        <br />
        Every chair, <span className="text-[#e8533f]">filled.</span>
      </motion.h1>
    </motion.div>
  );
}

export function HeroTextBottom() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="pointer-events-none relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
    >
      <motion.p
        variants={item}
        className="max-w-xl text-sm text-white/70 md:text-base"
      >
        Smart Serve is the always-on voice concierge that books, reschedules,
        and upsells for{" "}
        <span className="text-white">restaurants, salons & dental clinics</span>
        — so your team can focus on the people in front of them.
      </motion.p>

      <motion.div
        variants={item}
        className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/demo?source=hero-cta"
          className="group relative inline-flex items-center gap-2 rounded-full bg-[#e8533f] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(232,83,63,0.7)] transition-transform hover:scale-[1.03]"
        >
          Book a 15-min demo
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
        <Link
          href="/hear"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/10"
        >
          Hear it talk
        </Link>
      </motion.div>
    </motion.div>
  );
}
