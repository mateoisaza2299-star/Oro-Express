import { useEffect } from "react";
import type { ReactNode } from "react";
import { registerLenis } from "../lib/scroll.ts";
import "lenis/dist/lenis.css";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    if (reduce.matches || mobile.matches) return;

    let destroyed = false;
    let instance: { destroy: () => void } | null = null;

    void import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({
        autoRaf: true,
        duration: 1.05,
        smoothWheel: true,
        respectReducedMotion: true,
      });
      instance = lenis;
      registerLenis(lenis);
    });

    return () => {
      destroyed = true;
      instance?.destroy();
      registerLenis(null);
    };
  }, []);

  return children;
}
