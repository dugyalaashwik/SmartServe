"use client";

import { Suspense } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { ModelErrorBoundary } from "../ModelErrorBoundary";

const MODEL_PATH = "/models/dental.glb";

useGLTF.preload(MODEL_PATH);

function DentalModel() {
  const { scene } = useGLTF(MODEL_PATH);
  return <primitive object={scene.clone()} scale={0.4} />;
}

export function DentalPrimitive() {
  return (
    <group>
      {/* Crown — two lobes */}
      <mesh position={[-0.18, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#fafcff" metalness={0.1} roughness={0.35} />
      </mesh>
      <mesh position={[0.18, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#fafcff" metalness={0.1} roughness={0.35} />
      </mesh>
      {/* Bridge between lobes */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.36, 0.4, 0.4]} />
        <meshStandardMaterial color="#fafcff" metalness={0.1} roughness={0.35} />
      </mesh>

      {/* Roots — tapered cylinders */}
      <mesh position={[-0.13, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.05, 0.55, 24]} />
        <meshStandardMaterial color="#e8eef7" metalness={0.05} roughness={0.5} />
      </mesh>
      <mesh position={[0.13, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.05, 0.55, 24]} />
        <meshStandardMaterial color="#e8eef7" metalness={0.05} roughness={0.5} />
      </mesh>

      {/* Coral sparkle */}
      <mesh position={[0.05, 0.4, 0.25]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color="#e8533f"
          emissive="#e8533f"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

export function DentalIcon() {
  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.5}>
      <ModelErrorBoundary label="dental" fallback={<DentalPrimitive />}>
        <Suspense fallback={<DentalPrimitive />}>
          <DentalModel />
        </Suspense>
      </ModelErrorBoundary>
    </Float>
  );
}

/** Float-free version — safe to use inside a canvas that controls its own animation. */
export function DentalIconBare() {
  return (
    <ModelErrorBoundary label="dental" fallback={<DentalPrimitive />}>
      <Suspense fallback={<DentalPrimitive />}>
        <DentalModel />
      </Suspense>
    </ModelErrorBoundary>
  );
}
