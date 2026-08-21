import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";

export default function RollingNumber({ value, duration = 620 }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || fromRef.current === value) {
      fromRef.current = value;
      setDisplay(value);
      return undefined;
    }

    const from = fromRef.current;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, reducedMotion]);

  return <span className="rolling">{display}</span>;
}
