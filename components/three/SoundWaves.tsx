"use client";

import { HorizontalWave } from "./HorizontalWave";
import { HorizontalBouncer } from "./HorizontalBouncer";
import { RestaurantIcon } from "./verticals/RestaurantIcon";
import { SalonIcon } from "./verticals/SalonIcon";
import { DentalIcon } from "./verticals/DentalIcon";

const HALF_LENGTH = 4.2;

/**
 * Three horizontal sound waves emanating from the Smart Serve logo. Each
 * wave is offset on Y (and slightly Z to break up depth so the middle
 * wave doesn't visually collide with the logo).
 *
 * GLB riders are placed alternately left/right so the composition feels
 * balanced across the frame.
 */
const WAVES = [
  {
    // Top — cyan, GLB on the right
    centerY: 1.6,
    centerZ: 0,
    color: "#5fc3e8",
    phaseOffset: 0,
    glbX: 2.5,
    Component: RestaurantIcon,
  },
  {
    // Middle — coral, sitting behind the logo on Z, GLB on the left
    centerY: 0,
    centerZ: -1.5,
    color: "#e8533f",
    phaseOffset: 0.7,
    glbX: -2.5,
    Component: SalonIcon,
  },
  {
    // Bottom — electric blue, GLB on the right
    centerY: -1.7,
    centerZ: 0,
    color: "#3b8bd9",
    phaseOffset: 1.4,
    glbX: 2.2,
    Component: DentalIcon,
  },
] as const;

export function SoundWaves() {
  return (
    <group>
      {WAVES.map((w, i) => (
        <group key={i}>
          <HorizontalWave
            centerY={w.centerY}
            centerZ={w.centerZ}
            halfLength={HALF_LENGTH}
            color={w.color}
            phaseOffset={w.phaseOffset}
          />
          <HorizontalBouncer
            x={w.glbX}
            centerY={w.centerY}
            centerZ={w.centerZ}
            halfLength={HALF_LENGTH}
            phaseOffset={w.phaseOffset}
          >
            <w.Component />
          </HorizontalBouncer>
        </group>
      ))}
    </group>
  );
}
