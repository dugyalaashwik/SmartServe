"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Top-of-page navigation. Floats over the 3D canvas with a glassy backdrop.
 * Logo mark is rebuilt in SVG so it scales crisply and matches the supplied
 * Smart Serve logo (headphones + soundwave + "S").
 */
export function HeroNav() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#06142b]/60 px-6 py-4 backdrop-blur-md md:px-10"
    >
      <a href="/landing" className="flex items-center gap-3">
        <Logo />
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Smart <span className="text-[#5fc3e8]">Serve</span>
        </span>
      </a>

      <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
        <a className="transition-colors hover:text-white" href="#verticals">
          Verticals
        </a>
        <a className="transition-colors hover:text-white" href="#how">
          How it works
        </a>
        <a className="transition-colors hover:text-white" href="#pricing">
          Pricing
        </a>
      </div>

      <Link
        href="/demo?source=nav-cta"
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#06142b] transition-transform hover:scale-[1.03]"
      >
        Get started
      </Link>
    </motion.nav>
  );
}

function Logo() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="size-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Headphone band */}
      <path
        d="M6 22a14 14 0 0 1 28 0"
        stroke="#5fc3e8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left cup */}
      <rect x="5" y="20" width="6" height="11" rx="2" fill="#3b8bd9" />
      {/* Right cup */}
      <rect x="29" y="20" width="6" height="11" rx="2" fill="#3b8bd9" />
      {/* Sound wave bars */}
      <rect x="14" y="22" width="1.6" height="6" rx="0.8" fill="#e8533f" />
      <rect x="17" y="19" width="1.6" height="12" rx="0.8" fill="#e8533f" />
      <rect x="22" y="19" width="1.6" height="12" rx="0.8" fill="#e8533f" />
      <rect x="25" y="22" width="1.6" height="6" rx="0.8" fill="#e8533f" />
      {/* S mark */}
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fontFamily="serif"
        fontWeight="700"
        fontSize="11"
        fill="#e8533f"
      >
        S
      </text>
    </svg>
  );
}
