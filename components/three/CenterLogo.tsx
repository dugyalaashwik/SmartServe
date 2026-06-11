"use client";

import { Html, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

/**
 * The Smart Serve logo, centered in the scene. Renders the SVG logo via
 * Drei's <Html> so it stays crisp at any zoom and always faces the camera.
 *
 * A soft halo Sphere sits behind it for depth — the GLB verticals orbit
 * around this whole rig.
 */
export function CenterLogo() {
  const halo = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (halo.current) {
      // Subtle breathing pulse — matches the "voice listening" vibe.
      halo.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.08);
    }
  });

  return (
    <group>
      {/* Soft halo — basic material so it reads as glow, not a hard surface */}
      <Sphere ref={halo} args={[1, 48, 48]}>
        <meshBasicMaterial color="#3b8bd9" transparent opacity={0.18} />
      </Sphere>
      <Sphere args={[0.55, 32, 32]}>
        <meshBasicMaterial color="#5fc3e8" transparent opacity={0.28} />
      </Sphere>

      {/* The actual logo, billboarded via <Html> so it always faces the camera */}
      <Html
        center
        distanceFactor={6}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <BrandLogo />
      </Html>
    </group>
  );
}

/**
 * Inline SVG rebuild of the Smart Serve mark — headphones + soundwave + "S".
 * Sized in viewBox units so distanceFactor on <Html> controls final size.
 */
function BrandLogo() {
  return (
    <div
      style={{
        width: 220,
        height: 220,
        display: "grid",
        placeItems: "center",
        filter: "drop-shadow(0 0 28px rgba(95,195,232,0.55))",
      }}
    >
      <svg
        viewBox="0 0 80 80"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Smart Serve"
      >
        {/* Headphone band */}
        <path
          d="M14 44a26 26 0 0 1 52 0"
          stroke="#5fc3e8"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Cups */}
        <rect x="12" y="40" width="11" height="22" rx="3.5" fill="#3b8bd9" />
        <rect x="57" y="40" width="11" height="22" rx="3.5" fill="#3b8bd9" />
        {/* Soundwave bars */}
        <rect x="28" y="46" width="3" height="10" rx="1.5" fill="#e8533f" />
        <rect x="34" y="40" width="3" height="22" rx="1.5" fill="#e8533f" />
        <rect x="43" y="40" width="3" height="22" rx="1.5" fill="#e8533f" />
        <rect x="49" y="46" width="3" height="10" rx="1.5" fill="#e8533f" />
        {/* S mark */}
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="20"
          fill="#e8533f"
        >
          S
        </text>
      </svg>
    </div>
  );
}
