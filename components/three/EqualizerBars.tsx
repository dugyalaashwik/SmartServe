"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Mesh, Group } from "three";
import { RestaurantIcon } from "./verticals/RestaurantIcon";
import { SalonIcon } from "./verticals/SalonIcon";
import { DentalIcon } from "./verticals/DentalIcon";

/**
 * Equaliser-style music bars matching the soundwave bars inside the
 * Smart Serve logo. Each bar expands symmetrically from a center axis —
 * a coral half rises upward, a contrasting electric-blue half drops
 * downward — so the row reads like a centred stereo-VU display.
 *
 * The row sits slightly below the logo's vertical centre and emanates
 * horizontally to either side. Three GLBs ride the tops of three chosen
 * bars and bounce as those bars expand.
 */

// ─── Bar geometry ────────────────────────────────────────────────
const BAR_WIDTH = 0.08;
const BAR_SPACING = 0.28;
const BAR_BASE_HALF = 0.12; // minimum cylinder half-height (each direction)
const BAR_PEAK_HALF = 0.95; // maximum extra cylinder half-height (each direction)
// Each half is a cylinder body + a hemisphere cap on its *outer* end. The
// inner ends (where the two halves meet at y=0) are left flat so the bar
// reads as one continuous pill with a colour split in the middle.
const BAR_CAP_RADIUS = BAR_WIDTH / 2; // 0.1, hemisphere radius
const BAR_RADIAL_SEGMENTS = 20;
const BAR_CAP_HEIGHT_SEGMENTS = 12;

// ─── GLB sway ────────────────────────────────────────────────────
const SWAY_AMPLITUDE = 0.32; // how far each GLB drifts left/right (world units)
const SWAY_FREQ = 1.2; // how fast the sway oscillates

// ─── Animation ───────────────────────────────────────────────────
const PULSE_FREQ = 3.4;
const PHASE_PER_BAR = 0.45;

// ─── Layout ──────────────────────────────────────────────────────
const FIRST_INDEX = 5; // closest bar to logo — leaves a visual gap (~1.4 units)
const LAST_INDEX = 16; // farthest bar (~4.5 units out)
const ROW_Y_OFFSET = -0.25; // centre axis just below the logo's halo

// ─── Colours (from the logo) ─────────────────────────────────────
const TOP_COLOR = "#e8533f"; // coral — same as logo's soundwave bars
const BOTTOM_COLOR = "#3b8bd9"; // electric blue — contrast from logo's cups

/**
 * Half-height of a bar at time `t`. Top and bottom both use this — they
 * mirror each other around the center axis. Also exported semantically
 * so the GLB rider can position itself exactly on top.
 */
function barHalfHeight(index: number, time: number): number {
  const phase = index * PHASE_PER_BAR;
  const pulse = Math.abs(Math.sin(time * PULSE_FREQ + phase));
  const distance = Math.abs(index);
  // Mild distance falloff so far bars don't dominate the silhouette.
  const envelope = Math.max(0.5, 1 - distance / 18);
  return BAR_BASE_HALF + pulse * BAR_PEAK_HALF * envelope;
}

function Bar({ index }: { index: number }) {
  const topCylRef = useRef<Mesh>(null);
  const topCapRef = useRef<Mesh>(null);
  const bottomCylRef = useRef<Mesh>(null);
  const bottomCapRef = useRef<Mesh>(null);
  const x = index * BAR_SPACING;

  useFrame(({ clock }) => {
    const h = barHalfHeight(index, clock.getElapsedTime());

    // Top cylinder: flat top + flat bottom, anchored at y=0, grows up to y=h.
    if (topCylRef.current) {
      topCylRef.current.scale.y = h;
      topCylRef.current.position.y = h / 2;
    }
    // Top cap: hemisphere sitting on top of the cylinder at y=h.
    if (topCapRef.current) {
      topCapRef.current.position.y = h;
    }

    // Bottom mirrors the top.
    if (bottomCylRef.current) {
      bottomCylRef.current.scale.y = h;
      bottomCylRef.current.position.y = -h / 2;
    }
    if (bottomCapRef.current) {
      bottomCapRef.current.position.y = -h;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      {/* ── TOP HALF (coral) ────────────────────────────────── */}
      <mesh ref={topCylRef} castShadow>
        <cylinderGeometry
          args={[BAR_CAP_RADIUS, BAR_CAP_RADIUS, 1, BAR_RADIAL_SEGMENTS]}
        />
        <meshStandardMaterial
          color={TOP_COLOR}
          emissive={TOP_COLOR}
          emissiveIntensity={0.85}
          metalness={0.25}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={topCapRef} castShadow>
        {/* Top hemisphere: thetaStart=0, thetaLength=π/2 → upper half only */}
        <sphereGeometry
          args={[
            BAR_CAP_RADIUS,
            BAR_RADIAL_SEGMENTS,
            BAR_CAP_HEIGHT_SEGMENTS,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ]}
        />
        <meshStandardMaterial
          color={TOP_COLOR}
          emissive={TOP_COLOR}
          emissiveIntensity={0.85}
          metalness={0.25}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* ── BOTTOM HALF (electric blue) ─────────────────────── */}
      <mesh ref={bottomCylRef} castShadow>
        <cylinderGeometry
          args={[BAR_CAP_RADIUS, BAR_CAP_RADIUS, 1, BAR_RADIAL_SEGMENTS]}
        />
        <meshStandardMaterial
          color={BOTTOM_COLOR}
          emissive={BOTTOM_COLOR}
          emissiveIntensity={0.85}
          metalness={0.25}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={bottomCapRef} castShadow rotation={[Math.PI, 0, 0]}>
        {/* Same hemisphere, rotated 180° around X so the dome faces down */}
        <sphereGeometry
          args={[
            BAR_CAP_RADIUS,
            BAR_RADIAL_SEGMENTS,
            BAR_CAP_HEIGHT_SEGMENTS,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ]}
        />
        <meshStandardMaterial
          color={BOTTOM_COLOR}
          emissive={BOTTOM_COLOR}
          emissiveIntensity={0.85}
          metalness={0.25}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GLBOnBar({
  index,
  yOffset = 0.55,
  swayAmplitude = SWAY_AMPLITUDE,
  children,
}: {
  index: number;
  /** Extra clearance above the bar's top edge. Bump up for models whose
   *  bounding box extends well below their origin (e.g. the dental teeth). */
  yOffset?: number;
  /** Horizontal drift amplitude. Set to 0 to lock the GLB to its bar. */
  swayAmplitude?: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const baseX = index * BAR_SPACING;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const h = barHalfHeight(index, t);
    // Per-instance phase offset so the three GLBs don't sway in lockstep.
    const swayX = Math.sin(t * SWAY_FREQ + index * 0.7) * swayAmplitude;
    // h = cylinder half-height; total bar top is at h + BAR_CAP_RADIUS (dome).
    ref.current.position.set(baseX + swayX, h + BAR_CAP_RADIUS + yOffset, 0);
    ref.current.rotation.y = t * 0.5;
  });

  return <group ref={ref}>{children}</group>;
}

export function EqualizerBars() {
  // Symmetric list of bar indices, skipping the centre gap around the logo.
  const indices: number[] = [];
  for (let i = FIRST_INDEX; i <= LAST_INDEX; i++) {
    indices.push(-i, i);
  }

  return (
    // Sink the whole row a touch below the logo so the centre axis sits
    // just under the logo's halo.
    <group position={[0, ROW_Y_OFFSET, 0]}>
      {indices.map((idx) => (
        <Bar key={idx} index={idx} />
      ))}

      {/* GLBs riding three selected bars — picked for left/right balance.
          Dental gets extra yOffset because the teeth model spans both jaws,
          so its bounding box dips well below its model origin. */}
      <GLBOnBar index={-10}>
        <RestaurantIcon />
      </GLBOnBar>
      <GLBOnBar index={8}>
        <SalonIcon />
      </GLBOnBar>
      <GLBOnBar index={13} yOffset={0.95}>
        <DentalIcon />
      </GLBOnBar>
    </group>
  );
}
