import { useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

/**
 * Publishes scroll position as a --scroll custom property on :root, normalised
 * so 1 equals one viewport height. Parallax layers read it directly in CSS,
 * which keeps the work on the compositor instead of in React renders.
 */
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
