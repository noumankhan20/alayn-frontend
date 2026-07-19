"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { FieldScene } from "../motion/GlobalField";

const MotionLink = motion.create(Link);

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll input with a heavy, calm spring to make the transitions feel fluid and expensive
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 12, // Extremely calm, heavy spring
    damping: 24,
    mass: 2.2
  });

  // Force the network convergence to complete much earlier (by 40% scroll) so it is fully visible on screen
  const convergeProgress = useTransform(smoothProgress, [0, 0.42], [0, 1]);

  // Typography gains confidence and settles as the thread converges.
  const textOpacity = useTransform(smoothProgress, [0.15, 0.45], [0, 1]);
  const textY = useTransform(smoothProgress, [0.15, 0.45], [6, 0]); // Minimal 6px settle
  
  // CTA settles in place without translating, just quietly gaining confidence
  const ctaOpacity = useTransform(smoothProgress, [0.35, 0.6], [0, 1]);

  // Gaining confidence: Button background solidifies, text becomes white, border fades into solid fill
  const buttonBg = useTransform(smoothProgress, [0.4, 0.6], ["rgba(27, 42, 74, 0)", "rgba(27, 42, 74, 1)"]);
  const buttonColor = useTransform(smoothProgress, [0.4, 0.6], ["rgba(27, 42, 74, 0.85)", "rgba(255, 255, 255, 1)"]);
  const buttonBorder = useTransform(smoothProgress, [0.4, 0.6], ["1px solid rgba(27, 42, 74, 0.2)", "1px solid rgba(27, 42, 74, 0)"]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Precise grid setup (The Systems Field)
    const columns = 28;
    const rows = 18;
    const points: { x: number; y: number; ox: number; oy: number }[] = [];

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const x = (c / (columns - 1)) * width;
        const y = (r / (rows - 1)) * height;
        points.push({ x, y, ox: x, oy: y });
      }
    }

    // Coordinate badges
    const badges = [
      { label: "Orders Layer", x: 0.15, y: 0.28, color: "rgba(196, 30, 42, 0.9)", tx: 0, ty: 0 },
      { label: "Kitchen System", x: 0.82, y: 0.22, color: "rgba(27, 42, 74, 0.9)", tx: 0, ty: 0 },
      { label: "Inventory Index", x: 0.22, y: 0.72, color: "rgba(27, 42, 74, 0.9)", tx: 0, ty: 0 },
      { label: "Staff Roster", x: 0.78, y: 0.78, color: "rgba(196, 30, 42, 0.9)", tx: 0, ty: 0 },
    ];

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

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const scrollVal = convergeProgress.get(); // Driven by the accelerated convergeProgress
      const actualScroll = smoothProgress.get();

      // Draw mathematical background grid
      ctx.beginPath();
      ctx.strokeStyle = "rgba(27, 42, 74, 0.015)";
      ctx.lineWidth = 1;
      
      for (let c = 0; c < columns; c++) {
        const x = (c / (columns - 1)) * width;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let r = 0; r < rows; r++) {
        const y = (r / (rows - 1)) * height;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw HUD reticles and coordinates
      points.forEach((p) => {
        const dx = mouse.x - p.ox;
        const dy = mouse.y - p.oy;
        const dist = Math.hypot(dx, dy);

        // Grid warp effect under mouse
        if (dist < 180 && actualScroll < 0.1) {
          const force = (180 - dist) / 180;
          p.x = p.ox - (dx / dist) * force * 16;
          p.y = p.oy - (dy / dist) * force * 16;
        } else {
          // Spring back to original positions or converge on scroll
          const targetX = p.ox + (width / 2 - p.ox) * scrollVal * 0.45;
          const targetY = p.oy + (height * 0.14 - p.oy) * scrollVal * 0.45;
          p.x += (targetX - p.x) * 0.12;
          p.y += (targetY - p.y) * 0.12;
        }

        // Draw node dot
        ctx.fillStyle = `rgba(27, 42, 74, ${0.08 * (1 - actualScroll)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw elegant coordinate badges
      badges.forEach((b) => {
        // Linear interpolation to converge
        const startX = b.x * width;
        const startY = b.y * height;
        const targetX = width / 2;
        const targetY = height * 0.14; // Correctly offset to the clear space below the navbar (14% height)

        b.tx = startX + (targetX - startX) * scrollVal;
        b.ty = startY + (targetY - startY) * scrollVal; // Corrected typo (used to use startX/targetX)

        const isRed = b.color.includes("196");

        ctx.save();
        // Faint laser coordinate line connecting to center hub
        ctx.beginPath();
        ctx.moveTo(b.tx, b.ty);
        ctx.lineTo(width / 2, height * 0.14);
        ctx.strokeStyle = `rgba(27, 42, 74, ${0.04 * (1 - actualScroll)})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Draw delicate coordinate frame
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.roundRect(b.tx - 65, b.ty - 16, 130, 32, 6);
        ctx.fill();

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tiny red active light
        ctx.beginPath();
        ctx.arc(b.tx - 48, b.ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = isRed ? "#C41E2A" : "#1B2A4A";
        ctx.fill();

        // Label text (Show ALAYN when fully converged)
        const labelText = scrollVal > 0.8 ? "ALAYN" : b.label.toUpperCase();
        ctx.font = "bold 9px monospace, Courier, sans-serif";
        ctx.fillStyle = "#1B2A4A"; // Hardcoded Hex to support Canvas fillStyle rendering
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, b.tx - 38, b.ty);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [smoothProgress, convergeProgress]);

  return (
    <FieldScene
      id="boot"
      domId="scene-boot"
      chaos={0}
      sync={0}
      presence={0.03}
      className="hero-section"
      ariaLabel="Alayn"
      style={{ background: "#FFFFFF", padding: 0, overflow: "clip" }}
    >
      <div ref={containerRef} style={{ height: "200vh", position: "relative" }}>
        
        {/* Sticky Canvas and Typography */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* Intelligent Coordinate Grid Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              pointerEvents: "auto",
            }}
          />

          <motion.div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "880px",
              margin: "0 auto",
              padding: "0 24px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              pointerEvents: "none",
              opacity: textOpacity,
              y: textY,
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(2.5rem, 7.5vw, 5.5rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                color: "var(--espresso)",
                letterSpacing: "-0.03em",
                marginBottom: "24px",
              }}
            >
              The AI Operating System
              <br />
              <span style={{ 
                fontStyle: "italic", 
                color: "var(--amber)", 
                fontWeight: "400"
              }}>
                for Hospitality.
              </span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1.05rem, 2.8vw, 1.35rem)",
                lineHeight: 1.6,
                color: "var(--muted)",
                maxWidth: "600px",
                margin: "0 auto 44px",
                fontWeight: 500,
              }}
            >
              Quietly coordinating orders, kitchen, staff, payments and guests in one single fluid flow field — in real time.
            </p>

            <motion.div 
              style={{ pointerEvents: "auto", opacity: ctaOpacity }}
            >
              <MotionLink
                href="/signup"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                style={{ 
                  fontSize: "1.05rem", 
                  padding: "16px 36px", 
                  borderRadius: "30px", 
                  background: buttonBg as any,
                  color: buttonColor as any,
                  border: buttonBorder as any,
                  boxShadow: "0 20px 40px rgba(27,42,74,0.12)"
                }}
              >
                Experience Alayn
              </MotionLink>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </FieldScene>
  );
}
