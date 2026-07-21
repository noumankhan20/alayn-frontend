"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FieldScene } from "../motion/GlobalField";

const MODULES = [
  { name: "Staff", outcome: "Every shift, every employee — automatically aligned.", color: "rgba(196, 30, 42, 1)", angle: -90 },
  { name: "Stock", outcome: "Know where every rupee of stock goes. Restock instantly.", color: "rgba(27, 42, 74, 1)", angle: -30 },
  { name: "Orders", outcome: "Counter, table, third-party delivery — all in one sync stream.", color: "rgba(196, 30, 42, 1)", angle: 30 },
  { name: "Insight", outcome: "Forecast operational velocity before the day even starts.", color: "rgba(27, 42, 74, 1)", angle: 90 },
  { name: "Waste", outcome: "Pinpoint prep-shift food waste to the exact rupee value.", color: "rgba(196, 30, 42, 1)", angle: 150 },
  { name: "Guests", outcome: "Catch complaints and sync ticket updates before they leave.", color: "rgba(27, 42, 74, 1)", angle: -150 },
];

export default function ConvergenceScene() {
  const [hovered, setHovered] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<string | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Load logo image on mount
  useEffect(() => {
    const img = new Image();
    img.src = "/darktext.png";
    img.onload = () => {
      logoImageRef.current = img;
    };
  }, []);

  // Sync ref with state for the draw loop
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // Orbit network interactive animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let R = 150;
    let animationFrameId: number = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Recomputed on every resize (not just once at mount) — previously the
    // orbit's center/radius were frozen from the size at first render, so
    // rotating a phone or resizing the window left the whole diagram
    // permanently off-center relative to the canvas.
    const resize = () => {
      width = canvas.clientWidth || 400;
      height = 400;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = height / 2;
      R = Math.min(150, width * 0.36);
    };
    resize();
    window.addEventListener("resize", resize);

    let phase = 0;
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let isIntersecting = false;

    const draw = () => {
      if (!isIntersecting) {
        animationFrameId = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      // Draw orbit circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(27, 42, 74, 0.06)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pause rotation on hover so the user can easily read details
      if (!hoveredRef.current) {
        phase += 0.0045;
      }

      let currentHovered: string | null = null;

      // FIRST PASS: Calculate positions and draw spoke lines (Edges)
      const modulePositions = MODULES.map((mod) => {
        const angleRad = (mod.angle * Math.PI) / 180 + phase;
        const nx = cx + Math.cos(angleRad) * R;
        const ny = cy + Math.sin(angleRad) * R;

        const dist = Math.hypot(mouse.x - nx, mouse.y - ny);
        if (dist < 28) {
          currentHovered = mod.name;
        }

        const isHovered = hoveredRef.current === mod.name;

        // Draw connecting spoke line behind the nodes
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isHovered ? mod.color : "rgba(27, 42, 74, 0.1)";
        ctx.lineWidth = isHovered ? 1.5 : 0.75;
        ctx.stroke();

        return { mod, nx, ny, isHovered };
      });

      // SECOND PASS: Draw central hub (Node)
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2); // Slightly larger radius for the logo
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = "#1B2A4A";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (logoImageRef.current) {
        const img = logoImageRef.current;
        const maxW = 56;
        const maxH = 56;
        let w = img.width;
        let h = img.height;
        const ratio = w / h;
        if (w > maxW) {
          w = maxW;
          h = w / ratio;
        }
        if (h > maxH) {
          h = maxH;
          w = h * ratio;
        }
        ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      } else {
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#1B2A4A";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Alayn", cx, cy);
      }

      // THIRD PASS: Draw outer nodes and labels
      modulePositions.forEach(({ mod, nx, ny, isHovered }) => {
        // Draw node
        ctx.beginPath();
        ctx.arc(nx, ny, isHovered ? 28 : 24, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        ctx.strokeStyle = mod.color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Node label
        ctx.font = "bold 9px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = mod.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mod.name.toUpperCase(), nx, ny);
      });

      // Avoid unnecessary state cycles
      if (currentHovered !== hoveredRef.current) {
        setHovered(currentHovered);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(draw);
        }
      } else {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      }
    }, { threshold: 0 });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <FieldScene
      id="convergence"
      domId="scene-convergence"
      chaos={0.04}
      sync={0.85}
      presence={0.9}
      className="landing-section"
      style={{ background: "#F4F5F8", minHeight: "100vh", display: "flex", alignItems: "center" }}
      ariaLabel="Alayn"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
          
          {/* Interactive Network Diagram */}
          <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "460px", margin: "0 auto" }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
          </div>

          {/* Core Outcomes Panel */}
          <div>
            <span style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "14px" }}>
              The Unified Architecture
            </span>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--espresso)",
              marginBottom: "24px"
            }}>
              Six parts of your business.
              <br />
              <span style={{ fontStyle: "italic", color: "var(--amber)", fontWeight: "400" }}>One living system.</span>
            </h2>

            <p style={{ fontSize: "1.125rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "40px" }}>
              Alayn links order flows, recipe prep, staff availability, and accounting directly, creating a synchronized operational rhythm automatically. Hover on any node in the network to inspect the alignment.
            </p>

            {/* morphing context card */}
            <div style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-warm)",
              borderRadius: "16px",
              padding: "28px",
              minHeight: "140px",
              boxShadow: "0 12px 36px rgba(27,42,74,0.04)"
            }}>
              <AnimatePresence mode="wait">
                {hovered ? (
                  <motion.div
                    key={hovered}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--amber)", display: "block", marginBottom: "8px" }}>
                      Integrated Flow
                    </span>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--espresso)", margin: "0 0 10px" }}>
                      {hovered}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.5 }}>
                      {MODULES.find((m) => m.name === hovered)?.outcome}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", alignItems: "center", height: "100%", minHeight: "84px" }}
                  >
                    <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--muted)", fontStyle: "italic" }}>
                      Hover over any module on the network grid to explore its relationship.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </FieldScene>
  );
}
