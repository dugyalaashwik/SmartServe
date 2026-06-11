"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import {
  computePerpendicular,
  pluckAmplitude,
  stringDisplacement,
} from "./musicMath";

interface Props {
  /** Where the string ends. Must match the string's endpoint. */
  endpoint: [number, number, number];
  /** Fraction along the string (0..1) where the GLB sits. */
  positionT: number;
  /** Same phase offset passed to the matching MusicString. */
  phaseOffset?: number;
  children: ReactNode;
}

/**
 * Positions its children at a fixed fraction along the string, with their
 * Y/perpendicular offset matched to the string's wave equation. Result: the
 * GLB rides the string, bouncing wherever the string is bouncing.
 */
export function BouncingVertical({
  endpoint,
  positionT,
  phaseOffset = 0,
  children,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const perp = useMemo(() => computePerpendicular(endpoint), [endpoint]);

  const basePos = useMemo(
    () =>
      new THREE.Vector3(
        endpoint[0] * positionT,
        endpoint[1] * positionT,
        endpoint[2] * positionT,
      ),
    [endpoint, positionT],
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const amp = pluckAmplitude(t, phaseOffset);
    const wave = stringDisplacement(positionT, t + phaseOffset, amp);
    group.current.position.set(
      basePos.x + perp.x * wave,
      basePos.y + perp.y * wave,
      basePos.z + perp.z * wave,
    );
    // Gentle spin so the model presents from every angle as it bounces.
    group.current.rotation.y = t * 0.45 + phaseOffset;
  });

  return <group ref={group}>{children}</group>;
}
