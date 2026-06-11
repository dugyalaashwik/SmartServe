"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ComponentType } from "react";
import { VerticalCard, type VerticalCardProps } from "./VerticalCard";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface CarouselItem extends VerticalCardProps {
  Model: ComponentType;
  /** World-space scale for the background bouncing GLB (default 3.6). */
  modelScale?: number;
}

export function CardsGrid({
  items,
  index,
  setIndex,
}: {
  items: CarouselItem[];
  index: number;
  setIndex: (i: number) => void;
}) {
  const current = items[index];
  const { Model: _Model, ...cardProps } = current;

  function next() {
    setIndex((index + 1) % items.length);
  }

  return (
    <div className="relative mx-auto mt-16 max-w-xl">
      {/* ── Sliding card ── */}
      <div className="relative h-[420px] overflow-hidden md:h-[460px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ x: "-110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "110%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0"
          >
            <VerticalCard {...cardProps} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Side arrow ── */}
      <button
        type="button"
        onClick={next}
        aria-label="Next industry"
        className="absolute right-0 top-1/2 z-20 flex size-14 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#5fc3e8]/40 bg-[#5fc3e8]/10 text-[#5fc3e8] backdrop-blur-md transition-all hover:scale-110 hover:bg-[#5fc3e8]/20 hover:shadow-[0_0_30px_#5fc3e8aa]"
      >
        <ChevronRight />
      </button>

      {/* ── Pagination dots ── */}
      <div className="mt-10 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show industry ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 bg-[#5fc3e8] shadow-[0_0_10px_#5fc3e8]"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
