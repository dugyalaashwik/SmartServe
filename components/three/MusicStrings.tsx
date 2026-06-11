"use client";

import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { MusicString } from "./MusicString";
import { BouncingVertical } from "./BouncingVertical";
import { RestaurantIcon } from "./verticals/RestaurantIcon";
import { SalonIcon } from "./verticals/SalonIcon";
import { DentalIcon } from "./verticals/DentalIcon";
import { pluckAmplitude } from "./musicMath";

type StringConfig = {
  endpoint: [number, number, number];
  color: string;
  phaseOffset: number;
  positionT: number;
  Component: () => React.ReactNode;
};

/**
 * Three logo-coloured strings fanning out from world origin (where the
 * Smart Serve logo lives). The angle spread keeps them all visible to the
 * camera at (0, 0.4, 7) — two angled upward, one downward.
 */
const STRINGS: StringConfig[] = [
  {
    // Light cyan — upper right
    endpoint: [3.6, 1.4, 0],
    color: "#5fc3e8",
    phaseOffset: 0,
    positionT: 0.75,
    Component: RestaurantIcon,
  },
  {
    // Electric blue — upper left
    endpoint: [-3.6, 1.4, 0],
    color: "#3b8bd9",
    phaseOffset: 1.1,
    positionT: 0.75,
    Component: SalonIcon,
  },
  {
    // Coral — straight down
    endpoint: [0, -2.8, 0],
    color: "#e8533f",
    phaseOffset: 2.3,
    positionT: 0.75,
    Component: DentalIcon,
  },
];

export function MusicStrings() {
  return (
    <group>
      {STRINGS.map((cfg, i) => (
        <group key={i}>
          <MusicString
            endpoint={cfg.endpoint}
            color={cfg.color}
            phaseOffset={cfg.phaseOffset}
          />

          {/* Glowing anchor point at the far end — like a tuning peg */}
          <Anchor
            position={cfg.endpoint}
            color={cfg.color}
            phaseOffset={cfg.phaseOffset}
          />

          <BouncingVertical
            endpoint={cfg.endpoint}
            positionT={cfg.positionT}
            phaseOffset={cfg.phaseOffset}
          >
            <cfg.Component />
          </BouncingVertical>
        </group>
      ))}
    </group>
  );
}

/**
 * Tiny pulsing emissive sphere at the far end of a string. Brightens when
 * a pluck fires so each string visually "rings" when it's plucked.
 */
function Anchor({
  position,
  color,
  phaseOffset,
}: {
  position: [number, number, number];
  color: string;
  phaseOffset: number;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const amp = pluckAmplitude(t, phaseOffset);
    // amp ranges roughly 0.04 → 0.3; map to a brighter pulse.
    const intensity = 1 + amp * 6;
    const mat = meshRef.current.material as {
      emissiveIntensity?: number;
    };
    if (mat.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = intensity;
    }
    const scale = 1 + amp * 0.8;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Sphere ref={meshRef} args={[0.08, 24, 24]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        toneMapped={false}
      />
    </Sphere>
  );
}
