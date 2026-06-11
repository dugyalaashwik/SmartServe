"use client";

import dynamic from "next/dynamic";

/**
 * Client wrapper around the R3F Scene. Next 15 disallows `ssr: false` in
 * server components, so the dynamic import lives here and the server page
 * just imports <SceneClient />.
 */
export const SceneClient = dynamic(
  () => import("./Scene").then((m) => m.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.25em] text-white/30">
        Loading scene…
      </div>
    ),
  },
);
