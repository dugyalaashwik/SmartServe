"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Page-wide buttery scroll. Lenis hijacks the wheel/touch and lerps the scrollTop,
 * which makes scroll-driven 3D camera moves feel cinematic instead of jittery.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
