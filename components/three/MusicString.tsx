"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Line2 } from "three-stdlib";
import {
  STRING_SEGMENTS,
  computePerpendicular,
  pluckAmplitude,
  stringDisplacement,
} from "./musicMath";

interface Props {
  endpoint: [number, number, number];
  color: string;
  phaseOffset?: number;
  lineWidth?: number;
}

/**
 * One plucked music string radiating from world origin out to `endpoint`.
 * Updates the underlying Line2 geometry every frame so the wave actually
 * moves rather than being a static curve.
 */
export function MusicString({
  endpoint,
  color,
  phaseOffset = 0,
  lineWidth = 2.5,
}: Props) {
  const lineRef = useRef<Line2>(null);
  const perp = useMemo(() => computePerpendicular(endpoint), [endpoint]);

  // Initial straight-line points (only used for the first render).
  const basePoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= STRING_SEGMENTS; i++) {
      const t = i / STRING_SEGMENTS;
      pts.push([endpoint[0] * t, endpoint[1] * t, endpoint[2] * t]);
    }
    return pts;
  }, [endpoint]);

  // Reusable buffer so we don't allocate per frame.
  const flat = useMemo(
    () => new Float32Array((STRING_SEGMENTS + 1) * 3),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const amp = pluckAmplitude(t, phaseOffset);
    for (let i = 0; i <= STRING_SEGMENTS; i++) {
      const u = i / STRING_SEGMENTS;
      const wave = stringDisplacement(u, t + phaseOffset, amp);
      const bx = endpoint[0] * u;
      const by = endpoint[1] * u;
      const bz = endpoint[2] * u;
      flat[i * 3] = bx + perp.x * wave;
      flat[i * 3 + 1] = by + perp.y * wave;
      flat[i * 3 + 2] = bz + perp.z * wave;
    }
    if (lineRef.current) {
      // Line2's geometry exposes setPositions — much faster than rebuilding.
      lineRef.current.geometry.setPositions(flat);
    }
  });

  return (
    <Line
      ref={lineRef}
      points={basePoints}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={0.9}
    />
  );
}
