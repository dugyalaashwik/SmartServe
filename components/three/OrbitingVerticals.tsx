"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { RestaurantIcon } from "./verticals/RestaurantIcon";
import { SalonIcon } from "./verticals/SalonIcon";
import { DentalIcon } from "./verticals/DentalIcon";

/**
 * Places the 3 verticals at 120° around the AI orb and rotates the whole
 * group slowly. Each child <Float>s independently inside its slot, so the
 * orbit feels alive (not like a turntable).
 */
const RADIUS = 3.2;
const VERTICALS = [
  { Component: RestaurantIcon, angle: 0 },
  { Component: SalonIcon, angle: (2 * Math.PI) / 3 },
  { Component: DentalIcon, angle: (4 * Math.PI) / 3 },
];

export function OrbitingVerticals() {
  const orbit = useRef<Group>(null);

  useFrame((_, delta) => {
    if (orbit.current) {
      orbit.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={orbit}>
      {VERTICALS.map(({ Component, angle }, i) => (
        <group
          key={i}
          position={[
            Math.cos(angle) * RADIUS,
            Math.sin(angle * 0.6) * 0.4,
            Math.sin(angle) * RADIUS,
          ]}
        >
          <Component />
        </group>
      ))}
    </group>
  );
}
