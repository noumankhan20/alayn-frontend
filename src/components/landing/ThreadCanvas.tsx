"use client";

import { useEffect, useRef } from "react";

interface Thread {
  id: number;
  label: string;
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  phase: number;
  speed: number;
  opacity: number;
  progress: number;
  color: string;
  width: number;
}

const THREAD_COLORS = [
  "rgba(196, 30, 42, 0.55)",   // crimson — left stroke of A
  "rgba(27, 42, 74, 0.45)",    // navy — right stroke of A
  "rgba(196, 30, 42, 0.45)",   // crimson
  "rgba(27, 42, 74, 0.38)",    // navy
  "rgba(212, 41, 58, 0.5)",    // brighter crimson
  "rgba(36, 53, 86, 0.4)",     // lighter navy
];

const THREAD_LABELS = [
  "Orders", "Inventory", "Staff", "Waste", "Feedback", "Analytics"
];

export default function ThreadCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const threadsRef = useRef<Thread[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      initThreads();
    };

    const initThreads = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;

      // 6 threads from outer edges converging to center
      const positions = [
        { x: W * 0.05, y: H * 0.2 },   // top-left
        { x: W * 0.95, y: H * 0.15 },  // top-right
        { x: W * 0.02, y: H * 0.6 },   // mid-left
        { x: W * 0.98, y: H * 0.65 },  // mid-right
        { x: W * 0.25, y: H * 0.95 },  // bottom-left
        { x: W * 0.75, y: H * 0.95 },  // bottom-right
      ];

      threadsRef.current = positions.map((pos, i) => ({
        id: i,
        label: THREAD_LABELS[i],
        startX: pos.x,
        startY: pos.y,
        controlX: cx + (Math.random() - 0.5) * W * 0.3,
        controlY: cy + (Math.random() - 0.5) * H * 0.3,
        phase: (i / 6) * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0002,
        opacity: 0,
        progress: 0,
        color: THREAD_COLORS[i],
        width: 0.8 + Math.random() * 0.6,
      }));
    };

    const drawThread = (t: Thread, time: number, W: number, H: number) => {
      if (!ctx) return;
      const cx = W / 2;
      const cy = H / 2;

      // Animate progress: threads slowly converge
      const convergenceProgress = Math.min(1, time * 0.00015);
      const threadProgress = Math.min(1, convergenceProgress + t.phase * 0.05);

      // Interpolate end point from start toward center
      const endX = t.startX + (cx - t.startX) * threadProgress;
      const endY = t.startY + (cy - t.startY) * threadProgress;

      // Gentle sinusoidal drift on the control point
      const driftX = Math.sin(time * t.speed + t.phase) * 30;
      const driftY = Math.cos(time * t.speed * 0.7 + t.phase) * 20;
      const ctrlX = t.controlX + driftX;
      const ctrlY = t.controlY + driftY;

      // Fade in opacity
      t.opacity = Math.min(1, time * 0.0003);

      ctx.beginPath();
      ctx.moveTo(t.startX, t.startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);

      // Create gradient along the path
      const grad = ctx.createLinearGradient(t.startX, t.startY, endX, endY);
      grad.addColorStop(0, t.color.replace(/[\d.]+\)$/, "0)"));
      grad.addColorStop(0.4, t.color.replace(/[\d.]+\)$/, `${t.opacity * 0.3})`));
      grad.addColorStop(1, t.color.replace(/[\d.]+\)$/, `${t.opacity}`));

      ctx.strokeStyle = grad;
      ctx.lineWidth = t.width;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const drawCenterGlow = (time: number, W: number, H: number) => {
      if (!ctx) return;
      const cx = W / 2;
      const cy = H / 2;
      const convergence = Math.min(1, time * 0.00015);

      // Pulsing center orb
      const pulse = Math.sin(time * 0.001) * 0.15 + 0.85;
      const radius = 60 * convergence * pulse;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(196, 30, 42, ${0.14 * convergence})`);
      grad.addColorStop(0.5, `rgba(196, 30, 42, ${0.05 * convergence})`);
      grad.addColorStop(1, "rgba(196, 30, 42, 0)");

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const time = timestamp - startTimeRef.current;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      // Draw center glow first
      drawCenterGlow(time, W, H);

      // Draw each thread
      threadsRef.current.forEach((t) => {
        drawThread(t, time, W, H);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (!prefersReduced) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Static state for reduced motion
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;
      threadsRef.current.forEach((t) => {
        t.opacity = 0.7;
        ctx.beginPath();
        ctx.moveTo(t.startX, t.startY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = t.color;
        ctx.lineWidth = t.width;
        ctx.stroke();
      });
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="thread-canvas"
      aria-hidden="true"
      style={{ willChange: "transform" }}
    />
  );
}
