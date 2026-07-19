"use client";

import { useRef, useEffect } from "react";
import { FieldScene } from "../motion/GlobalField";

export default function ChaosScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 420);

    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    };
    window.addEventListener("resize", handleResize);

    const labels = [
      "Zomato ticket timed out",
      "Kitchen printer out of paper",
      "Late delivery rider",
      "Stock out on avocados",
      "Wrong payment terminal triggered",
      "Table 4 waiting 25 mins",
      "Staff call-out (No show)",
      "High food waste on dairy",
    ];

    // Create chaotic drifting tickets
    const items = labels.map((label, i) => {
      return {
        label,
        x: Math.random() * (width - 240) + 120,
        y: Math.random() * (height - 80) + 40,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        width: 220,
        height: 48,
        hue: i * 45,
        isActive: true,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections to grid intersections
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      items.forEach((item) => {
        if (!item.isActive) return;

        // Move items
        item.x += item.vx;
        item.y += item.vy;

        // Bounce
        if (item.x < 10 || item.x > width - item.width - 10) item.vx *= -1;
        if (item.y < 10 || item.y > height - item.height - 10) item.vy *= -1;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";

        // Draw ticket box
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.roundRect(item.x, item.y, item.width, item.height, 8);
        ctx.fill();
        ctx.stroke();

        // Crimson left accent line representing warning state
        ctx.fillStyle = "var(--amber)";
        ctx.fillRect(item.x, item.y + 4, 3, item.height - 8);

        // Label text
        ctx.font = "500 12px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.textAlign = "left";
        ctx.fillText(item.label, item.x + 14, item.y + item.height / 2 + 4);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
            Hospitality is rhythm.
            <br />
            <span style={{ fontStyle: "italic", color: "var(--amber)", fontWeight: "400" }}>
              Chaos is broken rhythm.
            </span>
          </h2>
          <p style={{
            color: "rgba(255, 255, 255, 0.55)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Disconnected tools create visual noise, late ticket prints, and operational blind spots.
          </p>
        </div>

        {/* Chaos Interactive Canvas Box */}
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
