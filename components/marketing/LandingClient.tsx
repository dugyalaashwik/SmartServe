"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const SceneClient = dynamic(
  () => import("@/components/three/SceneClient").then((m) => ({ default: m.SceneClient })),
  { ssr: false }
);

const VerticalsSection = dynamic(
  () => import("@/components/marketing/VerticalsSection").then((m) => ({ default: m.VerticalsSection })),
  { ssr: false }
);

export interface VerticalItem {
  emoji: string;
  title: string;
  body: string;
  tags: string[];
  glow: string;
  accent: string;
  Model: ComponentType;
  modelScale?: number;
  points: { icon: string; text: string }[];
}

export function LandingScene() {
  return <SceneClient />;
}

export function LandingVerticals({ items }: { items: VerticalItem[] }) {
  return <VerticalsSection items={items} />;
}
