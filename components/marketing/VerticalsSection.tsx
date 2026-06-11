"use client";

import { Suspense, useEffect, useRef, useState, type ComponentType } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useAnimationControls } from "framer-motion";
import type { Group } from "three";
import { CardsGrid, type CarouselItem } from "./CardsGrid";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Conservative bounding radius (world units) of a model at scale 3.6.
 * Used to keep the model fully inside the canvas when bouncing.
 */
const MODEL_RADIUS = 1.2;

// ─── Bouncing model ──────────────────────────────────────────────────────────

/**
 * Moves the model like a DVD screensaver — bounces off all four walls.
 * Position and velocity live in refs so they survive re-renders without
 * resetting. Uses `useThree` to get real viewport bounds each frame so
 * the physics work on any screen size.
 */
function BouncingModel({ Model, scale = 3.6 }: { Model: ComponentType; scale?: number }) {
  const ref = useRef<Group>(null);
  const { viewport } = useThree();

  // World-unit position and velocity (units / second)
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0.55, y: 0.38 });

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Clamp so the model's edge never crosses the frustum boundary
    const hw = Math.max(0, viewport.width  / 2 - MODEL_RADIUS);
    const hh = Math.max(0, viewport.height / 2 - MODEL_RADIUS);

    pos.current.x += vel.current.x * delta;
    pos.current.y += vel.current.y * delta;

    // Left / right walls
    if (pos.current.x >= hw)  { pos.current.x =  hw; vel.current.x = -Math.abs(vel.current.x); }
    if (pos.current.x <= -hw) { pos.current.x = -hw; vel.current.x =  Math.abs(vel.current.x); }

    // Top / bottom walls
    if (pos.current.y >= hh)  { pos.current.y =  hh; vel.current.y = -Math.abs(vel.current.y); }
    if (pos.current.y <= -hh) { pos.current.y = -hh; vel.current.y =  Math.abs(vel.current.y); }

    ref.current.position.set(pos.current.x, pos.current.y, 0);
    // Continuous Y-spin while bouncing
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref} scale={scale}>
      <Model />
    </group>
  );
}

// ─── Canvas layer ─────────────────────────────────────────────────────────────

function BounceCanvas({
  Model,
  accent,
  modelScale,
}: {
  Model: ComponentType;
  accent: string;
  modelScale?: number;
}) {
  const controls = useAnimationControls();

  // Fade in the new model whenever it swaps
  useEffect(() => {
    controls.start({
      opacity: [0.08, 0.75],
      transition: { duration: 0.55, ease: EASE },
    });
  }, [Model, controls]);

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0.75 }}
      className="pointer-events-none absolute inset-0 z-0"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 3, 4]} intensity={1.4} />
        <pointLight position={[-2, -2, -3]} intensity={2.5} color={accent} />
        <pointLight position={[2, 2, 2]}   intensity={1.2} color="#5fc3e8" />

        <Suspense fallback={null}>
          <BouncingModel Model={Model} scale={modelScale} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function VerticalsSection({ items }: { items: CarouselItem[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  return (
    <section
      id="verticals"
      className="relative w-full overflow-hidden py-32 md:py-40"
    >
      {/* Bouncing GLB — edge-to-edge across the full screen */}
      <BounceCanvas Model={current.Model} accent={current.accent} modelScale={current.modelScale} />

      {/* Foreground content — centred, readable */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          One voice.{" "}
          <span className="text-[#5fc3e8]">Three industries.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-white/65">
          The same Smart Serve brain, trained on the rhythms of each business —
          so it knows the difference between a 7pm dinner res, a balayage
          touch-up, and a six-month cleaning.
        </p>

        <CardsGrid items={items} index={index} setIndex={setIndex} />
      </div>
    </section>
  );
}
