"use client";

import { Suspense } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { ModelErrorBoundary } from "../ModelErrorBoundary";

const MODEL_PATH = "/models/salon.glb";

useGLTF.preload(MODEL_PATH);

function SalonModel() {
  const { scene } = useGLTF(MODEL_PATH);
  return <primitive object={scene.clone()} scale={0.4} />;
}

export function SalonPrimitive() {
  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      {/* Pivot screw */}
      <mesh>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color="#e8533f" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Blade 1 */}
      <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.7, 0.04]} />
        <meshStandardMaterial color="#cfe6f7" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Blade 2 */}
      <mesh position={[-0.3, 0.3, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.08, 0.7, 0.04]} />
        <meshStandardMaterial color="#cfe6f7" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Finger loops */}
      <mesh position={[-0.32, -0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.04, 16, 32]} />
        <meshStandardMaterial color="#3b8bd9" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.32, -0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.04, 16, 32]} />
        <meshStandardMaterial color="#3b8bd9" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Handle struts */}
      <mesh position={[-0.18, -0.18, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.06, 0.4, 0.04]} />
        <meshStandardMaterial color="#cfe6f7" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.18, -0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.06, 0.4, 0.04]} />
        <meshStandardMaterial color="#cfe6f7" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

export function SalonIcon() {
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.7}>
      <ModelErrorBoundary label="salon" fallback={<SalonPrimitive />}>
        <Suspense fallback={<SalonPrimitive />}>
          <SalonModel />
        </Suspense>
      </ModelErrorBoundary>
    </Float>
  );
}

/** Float-free version — safe to use inside a canvas that controls its own animation. */
export function SalonIconBare() {
  return (
    <ModelErrorBoundary label="salon" fallback={<SalonPrimitive />}>
      <Suspense fallback={<SalonPrimitive />}>
        <SalonModel />
      </Suspense>
    </ModelErrorBoundary>
  );
}
