"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

/**
 * Concentric rings that ripple outward like voice waves emanating from the orb.
 * Each ring scales on a phase-shifted sine and fades opacity at the peak,
 * so it feels like sound radiating outward continuously.
 */
const RING_COUNT = 4;

export function SoundWaveRings() {
  const group = useRef<Group>(null);
  const rings = useRef<Array<Mesh | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      // Each ring offset on a phase so they ripple sequentially.
      const phase = (t * 0.6 + i / RING_COUNT) % 1;
      const scale = 1.6 + phase * 2.4;
      ring.scale.setScalar(scale);
      const mat = ring.material as { opacity: number; transparent: boolean };
      mat.transparent = true;
      // Fade as it expands.
      mat.opacity = (1 - phase) * 0.35;
    });
    if (group.current) {
      group.current.rotation.z += 0.0015;
    }
  });

  return (
    <group ref={group} rotation={[Math.PI / 2.4, 0, 0]}>
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
        >
          <torusGeometry args={[1, 0.012, 16, 96]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#5fc3e8" : "#e8533f"} />
        </mesh>
      ))}
    </group>
  );
}
