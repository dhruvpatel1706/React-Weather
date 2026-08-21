import { useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

export function useScrollProgress() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = window.scrollY / Math.max(1, window.innerHeight);
      root.style.setProperty("--scroll", Math.min(3, progress).toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--scroll");
    };
  }, [reducedMotion]);
}
