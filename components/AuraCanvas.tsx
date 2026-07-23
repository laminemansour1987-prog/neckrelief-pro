"use client";

import { useEffect, useRef } from "react";

interface Blob {
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
}

const BLOB_COLORS = [
  "124,92,255", // aura
  "255,116,224", // bloom pink
  "82,180,255", // bloom blue
  "190,160,255", // soft violet highlight
  "255,140,120", // warm amber-coral accent
  "112,82,255", // aura (repeat for density)
];

export default function AuraCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let raf = 0;
    let visible = true;

    const blobs: Blob[] = BLOB_COLORS.map((color, i) => ({
      baseX: 0.15 + (i % 3) * 0.35,
      baseY: 0.22 + Math.floor(i / 3) * 0.58,
      radius: 0.48 - (i % 3) * 0.03,
      color,
      freqX: 0.00035 + i * 0.00008,
      freqY: 0.0005 + i * 0.00006,
      ampX: 0.14 + i * 0.015,
      ampY: 0.12 + i * 0.012,
      phase: i * 1.7,
    }));

    const particles: Particle[] = Array.from({ length: 46 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.2,
      speed: 0.0006 + Math.random() * 0.0012,
      phase: (i / 46) * Math.PI * 2,
    }));

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "screen";

      for (const b of blobs) {
        const x = (b.baseX + Math.sin(time * b.freqX + b.phase) * b.ampX) * width;
        const y = (b.baseY + Math.cos(time * b.freqY + b.phase) * b.ampY) * height;
        const r = b.radius * Math.min(width, height) * 2.2;
        const gradient = ctx!.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `rgba(${b.color},0.65)`);
        gradient.addColorStop(0.35, `rgba(${b.color},0.35)`);
        gradient.addColorStop(0.7, `rgba(${b.color},0.12)`);
        gradient.addColorStop(1, `rgba(${b.color},0)`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * p.speed * 6 + p.phase));
        const x = p.x * width;
        const y = p.y * height;
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255,255,255,${twinkle * 0.8})`;
        ctx!.arc(x, y, p.r * dpr, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Legibility scrims: keep the left text column dark, and fade the
      // bottom edge into the page background so the section ends softly.
      ctx!.globalCompositeOperation = "source-over";
      const leftScrim = ctx!.createLinearGradient(0, 0, width * 0.62, 0);
      leftScrim.addColorStop(0, "rgba(12,9,32,0.88)");
      leftScrim.addColorStop(0.55, "rgba(12,9,32,0.55)");
      leftScrim.addColorStop(1, "rgba(12,9,32,0)");
      ctx!.fillStyle = leftScrim;
      ctx!.fillRect(0, 0, width, height);

      const bottomScrim = ctx!.createLinearGradient(0, height * 0.45, 0, height);
      bottomScrim.addColorStop(0, "rgba(12,9,32,0)");
      bottomScrim.addColorStop(1, "rgba(12,9,32,1)");
      ctx!.fillStyle = bottomScrim;
      ctx!.fillRect(0, 0, width, height);
    }

    function loop(t: number) {
      if (visible) {
        frame = t;
        draw(frame);
      }
      raf = requestAnimationFrame(loop);
    }

    resize();
    draw(0);

    if (!reduceMotion) {
      raf = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      visible = document.visibilityState === "visible";
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
