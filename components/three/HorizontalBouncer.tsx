"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { waveDisplacement } from "./HorizontalWave";

interface Props {
  /** X position along the wave where the GLB sits. */
  x: number;
  centerY: number;
  centerZ?: number;
  halfLength: number;
  phaseOffset?: number;
  children: ReactNode;
}

/**
 * Anchors its child at (x, centerY, centerZ) and adds the wave's vertical
 * displacement each frame, so the GLB literally rides the wave.
 *
 * Uses the same `waveDisplacement` function the wave uses to compute its
 * own points — that's why the GLB stays glued to the wave instead of
 * drifting above or below it.
 */
export function HorizontalBouncer({
  x,
  centerY,
  centerZ = 0,
  halfLength,
  phaseOffset = 0,
  children,
}: Props) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() + phaseOffset;
    const dy = waveDisplacement(x, t, halfLength);
    group.current.position.set(x, centerY + dy, centerZ);
    // Gentle spin so the model presents from every angle as it bounces.
    group.current.rotation.y = t * 0.45;
  });

  return <group ref={group}>{children}</group>;
}
