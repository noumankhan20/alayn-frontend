"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FieldScene } from "../motion/GlobalField";
import { useCountUp } from "../motion/primitives";

const BRIEFING_LINES = [
  { 
    label: "Sales Intelligence", 
    text: "Revenue is up ₹18,400 vs last Tuesday. Cold beverages are driving 34% of morning ticket sizes.", 
    color: "#C41E2A", // Brand Crimson
    action: "Promote cold brews on self-checkout screen"
  },
  { 
    label: "Inventory Alert", 
    text: "Oat milk supplies will deplete by 3:15 PM under current consumption pace. Draft purchase order ready.", 
    color: "#C41E2A", // Brand Crimson
    action: "Approve restocking order (1-click)"
  },
  {
    label: "Staff Coordination",
    text: "Evening kitchen shift is short-staffed. Arjun is flagged as available for roster adjustment.",
    color: "#1B2A4A", // Brand Navy — was off-palette indigo
    action: "Send automated availability invite"
  },
  {
    label: "Waste Optimization",
    text: "Waste cost reached ₹2,140 yesterday, concentrated in morning prep. Standardizing prep portions recommended.",
    color: "#1B2A4A", // Brand Navy — was off-palette purple
    action: "Adjust kitchen prep metrics"
  },
];

export default function RunningScene() {
  const [activeLine, setActiveLine] = useState(0);
  const [signalsProcessed, setSignalsProcessed] = useState(148209);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLine((p) => (p + 1) % BRIEFING_LINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSignalsProcessed((p) => p + Math.floor(2 + Math.random() * 8));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const displaySignals = useCountUp(signalsProcessed);

  // Read via ref inside the draw loop instead of closing over `activeLine`
  // state — keeps the canvas effect's own dependency array empty below, so
  // the particle system mounts once instead of tearing down and respawning
  // every 4.5s (which made the particles visibly jump on every line change).
  const activeLineRef = useRef(0);
  useEffect(() => {
    activeLineRef.current = activeLine;
  }, [activeLine]);

  // Background visualizer canvas inside card
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.clientWidth || 300;
    let height = 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let animationFrameId: number = 0;

    const particles = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    }));

    let isIntersecting = false;

    const draw = () => {
      if (!isIntersecting) {
        animationFrameId = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      // Draw active line color coordinate connection
      const activeColor = BRIEFING_LINES[activeLineRef.current].color;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? activeColor : "rgba(255,255,255,0.2)";
        ctx.fill();
      });

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
    };
  }, []);

  return (
    <FieldScene
      id="running"
      domId="scene-running"
      chaos={0.03}
      sync={0.5}
      presence={0.55}
      className="landing-section section-dark noise-overlay"
      style={{ padding: "120px 0", minHeight: "100vh", display: "flex", alignItems: "center" }}
      ariaLabel="The system runs"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
          
          {/* Left Column: Context & Global Pulse */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 800,
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--cream-light)",
              marginBottom: "24px",
            }}>
              Then the business
              <br />
              <span style={{ fontStyle: "italic", color: "var(--amber)", fontWeight: "400" }}>runs itself.</span>
            </h2>
            <p style={{
              fontSize: "1.15rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: 1.6,
              marginBottom: "40px",
              maxWidth: "480px"
            }}>
              Instead of swimming in spreadsheets, get a clean, proactive feed of decisions. What went wrong, why it happened, and how to fix it in one click.
            </p>

            {/* Glowing Tracker Box */}
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "24px 32px",
              backdropFilter: "blur(12px)"
            }}>
              <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                Active Operations Layer
              </span>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono), monospace" }}>
                {displaySignals}
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--amber)", marginLeft: "8px", fontWeight: 500 }}>
                signals/min
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Briefing Stream */}
          <div style={{ position: "relative" }}>
            
            {/* Visualizer Canvas overlaying card container */}
            <div style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "220px",
              height: "220px",
              pointerEvents: "none",
              zIndex: 0,
              opacity: 0.35,
            }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
              {BRIEFING_LINES.map((line, i) => {
                const isActive = activeLine === i;
                return (
                  <motion.div
                    key={line.label}
                    animate={{
                      scale: isActive ? 1.02 : 1,
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.01)",
                      borderColor: isActive ? line.color : "rgba(255, 255, 255, 0.06)",
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={{
                      borderRadius: "16px",
                      border: "1px solid",
                      padding: "24px",
                      cursor: "pointer",
                      backdropFilter: "blur(8px)",
                    }}
                    onClick={() => setActiveLine(i)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: line.color }}>
                        {line.label}
                      </span>
                      {isActive && (
                        <span style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: line.color,
                          boxShadow: `0 0 10px ${line.color}`
                        }} />
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "1rem", color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)", lineHeight: 1.5 }}>
                      {line.text}
                    </p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "rgba(255,255,255,0.08)",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "#FFFFFF",
                            border: "1px solid rgba(255,255,255,0.15)"
                          }}>
                            {line.action}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </FieldScene>
  );
}
