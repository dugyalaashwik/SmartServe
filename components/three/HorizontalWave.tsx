"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Line2 } from "three-stdlib";

/**
 * Shared horizontal-wave equation. Exported so the bouncing GLB rider can
 * use the *exact same math* — otherwise it visibly drifts off the wave.
 *
 * envelope(|x|) = sin(πu) where u = |x|/halfLength, so the wave amplitude
 * is zero at the logo (x=0), peaks at u=0.5, and returns to zero at the
 * far endpoints. This makes the wave look like sound radiating outward
 * from the centre, then dampening as it leaves.
 */
export const WAVE_SPATIAL_FREQ = 3.0;
export const WAVE_TEMPORAL_FREQ = 4.2;
export const WAVE_AMPLITUDE = 0.4;
const SEGMENTS = 96;

export function waveDisplacement(
  x: number,
  t: number,
  halfLength: number,
): number {
  const absX = Math.abs(x);
  const u = absX / halfLength;
  if (u >= 1) return 0;
  const envelope = Math.sin(u * Math.PI);
  // sin(k|x| - ωt) makes the wave travel *outward* from x=0 in both directions.
  return (
    Math.sin(WAVE_SPATIAL_FREQ * absX - WAVE_TEMPORAL_FREQ * t) *
    envelope *
    WAVE_AMPLITUDE
  );
}

interface Props {
  centerY: number;
  centerZ?: number;
  /** Wave extends from -halfLength to +halfLength on the X axis. */
  halfLength: number;
  color: string;
  phaseOffset?: number;
  lineWidth?: number;
}

export function HorizontalWave({
  centerY,
  centerZ = 0,
  halfLength,
  color,
  phaseOffset = 0,
  lineWidth = 3,
}: Props) {
  const ref = useRef<Line2>(null);

  const basePoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      const x = -halfLength + 2 * halfLength * u;
      pts.push([x, centerY, centerZ]);
    }
    return pts;
  }, [halfLength, centerY, centerZ]);

  // Reusable buffer — no per-frame allocations.
  const flat = useMemo(
    () => new Float32Array((SEGMENTS + 1) * 3),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phaseOffset;
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      const x = -halfLength + 2 * halfLength * u;
      const y = centerY + waveDisplacement(x, t, halfLength);
      flat[i * 3] = x;
      flat[i * 3 + 1] = y;
      flat[i * 3 + 2] = centerZ;
    }
    if (ref.current) ref.current.geometry.setPositions(flat);
  });

  return (
    <Line
      ref={ref}
      points={basePoints}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={0.95}
    />
  );
}
