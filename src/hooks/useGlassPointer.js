import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";

export function useGlassPointer() {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return undefined;
    if (window.matchMedia?.("(pointer: coarse)").matches) return undefined;

    let frame = 0;
    let pending = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      node.style.setProperty("--mx", pending.x.toFixed(3));
      node.style.setProperty("--my", pending.y.toFixed(3));
    };

    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      pending = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      node.style.setProperty("--mx", "0.5");
      node.style.setProperty("--my", "0.3");
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return ref;
}
