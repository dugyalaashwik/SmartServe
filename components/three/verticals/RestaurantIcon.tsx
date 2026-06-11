"use client";

import { Suspense } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { ModelErrorBoundary } from "../ModelErrorBoundary";

const MODEL_PATH = "/models/restaurant.glb";

// Prime the cache so the GLB starts downloading the moment the bundle loads.
useGLTF.preload(MODEL_PATH);

function RestaurantModel() {
  const { scene } = useGLTF(MODEL_PATH);
  // Clone so multiple instances of the same model don't share a mutated graph.
  return <primitive object={scene.clone()} scale={0.4} />;
}

export function RestaurantPrimitive() {
  return (
    <group>
      {/* Plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 48]} />
        <meshStandardMaterial color="#5fc3e8" metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Inner plate ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]}>
        <ringGeometry args={[0.32, 0.42, 48]} />
        <meshStandardMaterial color="#3b8bd9" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Fork handle */}
      <mesh position={[0.15, 0.35, 0.05]}>
        <boxGeometry args={[0.05, 0.55, 0.05]} />
        <meshStandardMaterial color="#e8533f" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Fork tines */}
      {[-0.06, -0.02, 0.02, 0.06].map((x) => (
        <mesh key={x} position={[0.15 + x, 0.72, 0.05]}>
          <boxGeometry args={[0.018, 0.18, 0.04]} />
          <meshStandardMaterial color="#e8533f" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function RestaurantIcon() {
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <ModelErrorBoundary label="restaurant" fallback={<RestaurantPrimitive />}>
        <Suspense fallback={<RestaurantPrimitive />}>
          <RestaurantModel />
        </Suspense>
      </ModelErrorBoundary>
    </Float>
  );
}

/** Float-free version — safe to use inside a canvas that controls its own animation. */
export function RestaurantIconBare() {
  return (
    <ModelErrorBoundary label="restaurant" fallback={<RestaurantPrimitive />}>
      <Suspense fallback={<RestaurantPrimitive />}>
        <RestaurantModel />
      </Suspense>
    </ModelErrorBoundary>
  );
}
