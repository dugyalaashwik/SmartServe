"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { CenterLogo } from "./CenterLogo";
import { EqualizerBars } from "./EqualizerBars";

/**
 * Scroll-driven camera dolly. Lenis (via the root layout) smooths the
 * scrollTop, then this component reads it on each frame and lerps the
 * camera z + y so the orb feels like it pulls closer as you scroll the hero.
 *
 * We intentionally use window.scrollY rather than a Drei <ScrollControls>
 * because we want the rest of the page to scroll normally below the hero.
 */
function ScrollDolly() {
  const { camera } = useThree();
  const target = useRef({ z: 7, y: 0.4 });

  useFrame(() => {
    if (typeof window === "undefined") return;
    const heroHeight = window.innerHeight;
    // Normalize scroll across the first viewport-height of scrolling.
    const t = Math.min(1, Math.max(0, window.scrollY / heroHeight));
    target.current.z = 7 - t * 2.8; // dolly in
    target.current.y = 0.4 + t * 0.6; // tilt up
    camera.position.z += (target.current.z - camera.position.z) * 0.06;
    camera.position.y += (target.current.y - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#06142b"]} />
      <fog attach="fog" args={["#06142b", 8, 18]} />

      {/* Lights — cool key + coral rim to mirror the logo palette */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.2}
        color="#cfe6f7"
        castShadow
      />
      <pointLight position={[-4, -2, -3]} intensity={2.5} color="#e8533f" />
      <pointLight position={[4, 3, 3]} intensity={2} color="#3b8bd9" />

      <Suspense fallback={null}>
        <Environment preset="night" />
        <Sparkles
          count={120}
          scale={[14, 8, 14]}
          size={2.5}
          speed={0.35}
          color="#5fc3e8"
        />
        <CenterLogo />
        <EqualizerBars />
      </Suspense>

      <ScrollDolly />
    </Canvas>
  );
}
