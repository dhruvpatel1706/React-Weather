import { useEffect, useRef } from "react";
import { SCENE, weatherScene } from "../lib/weatherCodes.js";
import { dayPhase } from "../lib/sky.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import "../styles/sky.css";

export default function SkyBackground({ weather }) {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const code = weather?.current?.code ?? 0;
  const scene = weatherScene(code);
  const phase = dayPhase(weather);
  const isNight = phase === "night";
  const showSun = scene === SCENE.CLEAR;
  const showRays =
    !isNight && (scene === SCENE.CLEAR || scene === SCENE.CLOUDS);

  const windSpeed = weather?.current?.windSpeed ?? 0;
  const windDirection = weather?.current?.windDirection ?? 0;
  // Reported direction is where the wind blows *from*; particles travel the
  // opposite bearing. Screen y grows downward, hence the negated cosine.
  const bearingRad = ((windDirection + 180) % 360) * (Math.PI / 180);
  const gust = Math.min(1, windSpeed / 60);
  const windX = Math.sin(bearingRad) * gust;
  const windY = -Math.cos(bearingRad) * gust;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frame = 0;
    let flashUntil = 0;
    let nextFlash = 0;

    const random = (min, max) => min + Math.random() * (max - min);

    function build() {
      const area = width * height;
      const density = Math.min(1.6, area / 900000);
      particles = [];

      if (scene === SCENE.RAIN || scene === SCENE.THUNDER) {
        const count = Math.round(220 * density);
        for (let i = 0; i < count; i += 1) {
          particles.push({
            x: random(0, width),
            y: random(0, height),
            len: random(12, 30),
            speed: random(11, 19),
            drift: windX * random(6, 11) + random(-0.5, 0.5),
            alpha: random(0.18, 0.5),
          });
        }
      } else if (scene === SCENE.DRIZZLE) {
        const count = Math.round(150 * density);
        for (let i = 0; i < count; i += 1) {
          particles.push({
            x: random(0, width),
            y: random(0, height),
            len: random(5, 11),
            speed: random(5, 9),
            drift: windX * random(3, 6) + random(-0.3, 0.3),
            alpha: random(0.14, 0.34),
          });
        }
      } else if (scene === SCENE.SNOW) {
        const count = Math.round(150 * density);
        for (let i = 0; i < count; i += 1) {
          particles.push({
            x: random(0, width),
            y: random(0, height),
            r: random(1.2, 3.4),
            speed: random(0.5, 1.6),
            sway: random(0.4, 1.5),
            drift: windX * random(1.4, 3),
            phase: random(0, Math.PI * 2),
            alpha: random(0.35, 0.9),
          });
        }
      } else if (isNight && (scene === SCENE.CLEAR || scene === SCENE.CLOUDS)) {
        const count = Math.round(160 * density);
        for (let i = 0; i < count; i += 1) {
          particles.push({
            x: random(0, width),
            y: random(0, height * 0.75),
            r: random(0.4, 1.5),
            twinkle: random(0.006, 0.03),
            phase: random(0, Math.PI * 2),
            alpha: random(0.25, 0.95),
          });
        }
      } else if (scene === SCENE.FOG) {
        for (let i = 0; i < 7; i += 1) {
          particles.push({
            x: random(-0.3, 1.1) * width,
            y: random(0.15, 0.9) * height,
            r: random(0.25, 0.6) * width,
            speed: random(0.08, 0.28) + Math.abs(windX) * 0.5,
            dir: windX >= 0 ? 1 : -1,
            alpha: random(0.05, 0.13),
          });
        }
      } else {
        for (let i = 0; i < 6; i += 1) {
          particles.push({
            x: random(-0.3, 1.1) * width,
            y: random(0.04, 0.55) * height,
            r: random(0.18, 0.42) * width,
            speed: random(0.05, 0.2) + Math.abs(windX) * 0.6,
            dir: windX >= 0 ? 1 : -1,
            alpha: random(0.05, 0.14),
          });
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawStreaks() {
      ctx.lineCap = "round";
      for (const p of particles) {
        ctx.strokeStyle = `rgba(200, 225, 255, ${p.alpha})`;
        ctx.lineWidth = p.len > 14 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.drift * 2, p.y + p.len);
        ctx.stroke();
        p.x += p.drift;
        p.y += p.speed;
        if (p.y > height) {
          p.y = -p.len;
          p.x = random(0, width);
        }
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
      }
    }

    function drawSnow() {
      for (const p of particles) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.phase += 0.012;
        p.x += Math.sin(p.phase) * p.sway * 0.6 + (p.drift ?? 0);
        p.y += p.speed + windY * 0.4;
        if (p.y > height + 6) {
          p.y = -6;
          p.x = random(0, width);
        }
      }
    }

    function drawStars() {
      for (const p of particles) {
        p.phase += p.twinkle;
        const alpha = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawBanks() {
      for (const p of particles) {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speed * (p.dir ?? 1);
        if (p.dir === -1 && p.x + p.r < 0) p.x = width + p.r;
        if (p.dir !== -1 && p.x - p.r > width) p.x = -p.r;
      }
    }

    function drawLightning(now) {
      if (now > nextFlash) {
        flashUntil = now + random(90, 190);
        nextFlash = now + random(3800, 11000);
      }
      if (now < flashUntil) {
        ctx.fillStyle = `rgba(226, 232, 255, ${random(0.1, 0.28)})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    function tick(now) {
      ctx.clearRect(0, 0, width, height);

      if (scene === SCENE.RAIN || scene === SCENE.THUNDER) {
        drawStreaks();
        if (scene === SCENE.THUNDER) drawLightning(now);
      } else if (scene === SCENE.DRIZZLE) {
        drawStreaks();
      } else if (scene === SCENE.SNOW) {
        drawSnow();
      } else if (isNight && (scene === SCENE.CLEAR || scene === SCENE.CLOUDS)) {
        drawStars();
      } else {
        drawBanks();
      }

      frame = requestAnimationFrame(tick);
    }

    resize();
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [scene, isNight, reducedMotion, windX, windY]);

  return (
    <div
      className="sky"
      data-scene={scene}
      data-phase={phase}
      aria-hidden="true"
    >
      <div className="sky__mesh" />
      <div className="sky__haze" />
      {showRays && <div className="sky__rays" />}
      {!isNight && showSun && <div className="sky__sun" />}
      {isNight && <div className="sky__moon" />}
      {!reducedMotion && <canvas ref={canvasRef} className="sky__canvas" />}
      <div className="sky__grain" />
      <div className="sky__vignette" />
    </div>
  );
}
