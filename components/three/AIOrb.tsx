"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * The "voice" of Smart Serve — a glowing, distorted sphere that pulses
 * like an active waveform. Distortion + speed both modulate on a sine so
 * it looks like the orb is breathing/listening.
 */
export function AIOrb() {
  const inner = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.6) * 0.04;
    if (inner.current) {
      inner.current.scale.setScalar(pulse);
      inner.current.rotation.y = t * 0.25;
      inner.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    }
    if (halo.current) {
      halo.current.scale.setScalar(1 + Math.sin(t * 1.6 + 0.6) * 0.08);
    }
  });

  return (
    <group>
      {/* Outer soft halo — additive-feel glow */}
      <Sphere ref={halo} args={[1.55, 32, 32]}>
        <meshBasicMaterial color="#3b8bd9" transparent opacity={0.08} />
      </Sphere>

      {/* Core orb */}
      <Sphere ref={inner} args={[1.2, 96, 96]}>
        <MeshDistortMaterial
          color="#1a5fb8"
          emissive="#3b8bd9"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.15}
          distort={0.35}
          speed={1.8}
        />
      </Sphere>

      {/* Inner highlight orb for depth */}
      <Sphere args={[0.6, 48, 48]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#5fc3e8"
          emissive="#5fc3e8"
          emissiveIntensity={0.9}
          transparent
          opacity={0.35}
        />
      </Sphere>
    </group>
  );
}
