"use client";

import { useRef, useEffect } from "react";
import { FieldScene } from "../motion/GlobalField";

// Brand crimson warning → calm resolved green. Canvas 2D never resolves CSS
// custom properties, so these are the literal token values.
const WARN = { r: 0xc4, g: 0x1e, b: 0x2a }; // #C41E2A
const CALM = { r: 0x34, g: 0xb2, b: 0x7b }; // #34B27B

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// 0 below `a`, 1 above `b`, smooth in between.
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixColor = (t: number) => {
  const r = Math.round(lerp(WARN.r, CALM.r, t));
  const g = Math.round(lerp(WARN.g, CALM.g, t));
  const b = Math.round(lerp(WARN.b, CALM.b, t));
  return `rgb(${r}, ${g}, ${b})`;
};

export default function ChaosScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = 420;

    const ITEM_W = 220;
    const ITEM_H = 48;

    const applySize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applySize();

    let animationFrameId = 0;

    const labels = [
      "Forgot to log a sale",
      "Lost track of a table's order",
      "Ran out of stock, no one noticed",
      "Staff shift mix-up",
      "Manual tally at closing",
      "Missed a reorder",
      "No record of today's waste",
      "Two people counting the same stock",
    ];

    // Ordered destination: a tidy 2-column grid, centered in the box.
    const cols = 2;
    const gapX = 40;
    const gridW = cols * ITEM_W + gapX;
    const startX = (width - gridW) / 2;
    const rows = Math.ceil(labels.length / cols);
    const rowSpace = (height - 80) / rows;

    const gridPos = (i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: startX + col * (ITEM_W + gapX),
        y: 40 + row * rowSpace + (rowSpace - ITEM_H) / 2,
      };
    };

    const hub = { x: width / 2, y: height / 2 };

    // Timed autoplay: once the section is in view the sequence runs on its own
    // clock so the resolution always completes while it's still on screen,
    // independent of how fast the user scrolls.
    const DURATION = 4200; // ms for the full chaos → order → connected arc
    let startTime = 0;

    // Each ticket carries a drifting "chaos" position and a fixed grid slot.
    const items = labels.map((label, i) => ({
      label,
      cx: Math.random() * (width - ITEM_W - 40) + 20, // drifting chaos position
      cy: Math.random() * (height - ITEM_H - 40) + 20,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      grid: gridPos(i),
    }));

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };

    let isIntersecting = false;

    const render = (p: number) => {
      const snap = smoothstep(0.35, 0.65, p); // chaos → ordered
      const ease = snap * snap * (3 - 2 * snap); // extra easing on convergence
      const connect = smoothstep(0.6, 0.82, p); // connection lines fade in

      ctx.clearRect(0, 0, width, height);

      // Faint vertical grid, calming as things resolve.
      ctx.strokeStyle = `rgba(255,255,255,${0.03 + 0.02 * snap})`;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Resolved positions for this frame.
      const positions = items.map((item) => ({
        x: lerp(item.cx, item.grid.x, ease),
        y: lerp(item.cy, item.grid.y, ease),
      }));

      // Connections to the central hub — "one connected platform".
      if (connect > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(52, 178, 123, ${0.28 * connect})`;
        ctx.lineWidth = 1;
        positions.forEach((pos) => {
          ctx.beginPath();
          ctx.moveTo(hub.x, hub.y);
          ctx.lineTo(pos.x + ITEM_W / 2, pos.y + ITEM_H / 2);
          ctx.stroke();
        });
        // Hub node.
        ctx.fillStyle = `rgba(52, 178, 123, ${0.85 * connect})`;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const accent = mixColor(snap);

      items.forEach((item, idx) => {
        const pos = positions[idx];

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + 0.03 * snap})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + 0.1 * snap})`;
        roundRect(pos.x, pos.y, ITEM_W, ITEM_H, 8);
        ctx.fill();
        ctx.stroke();

        // Left accent line: crimson warning → calm green as it resolves.
        ctx.shadowBlur = 0;
        ctx.fillStyle = accent;
        ctx.fillRect(pos.x, pos.y + 4, 3, ITEM_H - 8);

        ctx.font = "500 12px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + 0.2 * snap})`;
        ctx.textAlign = "left";
        ctx.fillText(item.label, pos.x + 14, pos.y + ITEM_H / 2 + 4);
        ctx.restore();
      });

      // Intent caption, cross-fading between the two states.
      const drawCaption = (text: string, color: string, alpha: number) => {
        if (alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = "600 12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        const padX = 28;
        const w = ctx.measureText(text).width + padX * 2;
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        roundRect(24, 20, w, 26, 13);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(24 + padX + 3, 33, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(text, 24 + padX + 12, 37);
        ctx.restore();
      };
      drawCaption("The everyday chaos", "#C41E2A", 1 - snap);
      drawCaption("One connected system", "#34B27B", snap);
    };

    const draw = (now: number) => {
      if (!isIntersecting) {
        animationFrameId = 0;
        return;
      }
      if (!startTime) startTime = now;
      const p = clamp((now - startTime) / DURATION, 0, 1);
      const snap = smoothstep(0.35, 0.65, p);

      // Keep drifting while chaotic; settle as we snap.
      items.forEach((item) => {
        const drift = 1 - snap;
        item.cx += item.vx * drift;
        item.cy += item.vy * drift;
        if (item.cx < 10 || item.cx > width - ITEM_W - 10) item.vx *= -1;
        if (item.cy < 10 || item.cy > height - ITEM_H - 10) item.vy *= -1;
      });

      render(p);

      // Hold the resolved end state; stop the loop once fully connected.
      if (p >= 1) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      applySize();
      if (reduceMotion) render(1);
    };
    window.addEventListener("resize", handleResize);

    if (reduceMotion) {
      // No animation: show the resolved, connected end state.
      render(1);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    render(0); // paint the initial chaos frame before playback begins

    // Start when the box is meaningfully in view so the arc plays centered.
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.intersectionRatio >= 0.9;
        if (isIntersecting && !animationFrameId) {
          animationFrameId = requestAnimationFrame(draw);
        } else if (!isIntersecting && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      },
      { threshold: [0, 0.4, 0.75, 1] }
    );
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <FieldScene
      id="chaos"
      domId="how-it-works"
      chaos={0.85}
      sync={0.05}
      presence={0.85}
      className="landing-section section-dark noise-overlay"
      style={{ padding: "120px 0", minHeight: "100vh", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5.5vw, 4rem)",
            lineHeight: 1.1,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            marginBottom: "24px"
          }}>
            Hospitality deserves better systems.
            <br />
            <span style={{ fontStyle: "italic", color: "var(--amber)", fontWeight: "400" }}>
              One connected platform. Complete operational visibility.
            </span>
          </h2>
          <p style={{
            color: "rgba(255, 255, 255, 0.65)",
            maxWidth: "680px",
            margin: "0 auto",
            fontSize: "1.0625rem",
            lineHeight: 1.6
          }}>
            Replace fragmented tools with an intelligent operating system that keeps every team, process and location perfectly aligned.
          </p>
        </div>

        {/* Chaos → order interactive canvas. Scroll scrubs it from scattered
            tickets into one connected, aligned system. */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative"
        }}>
          <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
        </div>

      </div>
    </FieldScene>
  );
}
