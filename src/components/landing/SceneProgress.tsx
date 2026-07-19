"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const SCENES = [
  { id: "scene-boot", label: "Boot" },
  { id: "how-it-works", label: "Chaos" },
  { id: "scene-convergence", label: "Convergence" },
  { id: "scene-running", label: "Running" },
  { id: "scene-verticals", label: "Verticals" },
  { id: "scene-calm", label: "Calm" },
  { id: "scene-waiting", label: "Waiting" },
];

/**
 * A minimal system-status readout, not a generic scroll progress bar —
 * matches the scroll-triggered-storytelling guideline (a progress indicator
 * reduces disorientation in long narrative pages) but styled as part of the
 * intelligence-field language rather than a bolted-on UI chrome element.
 */
export default function SceneProgress() {
  const [active, setActive] = useState(0);
  const ratiosRef = useRef<number[]>(new Array(SCENES.length).fill(0));

  useEffect(() => {
    const els = SCENES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = SCENES.findIndex((s) => s.id === entry.target.id);
          if (idx !== -1) ratiosRef.current[idx] = entry.intersectionRatio;
        });
        let best = 0;
        let bestRatio = -1;
        ratiosRef.current.forEach((r, i) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        setActive(best);
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Page progress"
      className="scene-progress"
      style={{
        position: "fixed",
        right: "28px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "16px",
      }}
    >
      {SCENES.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {active === i && (
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: "0.625rem",
                fontFamily: "var(--font-mono), monospace",
                letterSpacing: "0.04em",
                color: "var(--espresso)",
                whiteSpace: "nowrap",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(6px)",
                border: "1px solid var(--border-warm)",
                borderRadius: "100px",
                padding: "3px 9px",
              }}
            >
              {s.label.toLowerCase()}
            </motion.span>
          )}
          <motion.span
            animate={{
              scale: active === i ? 1.3 : 1,
              backgroundColor: active === i ? "var(--amber)" : "rgba(127, 127, 127, 0.4)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              boxShadow: active === i ? "0 0 0 3px rgba(196, 30, 42, 0.15)" : "none",
            }}
          />
        </div>
      ))}

      <style>{`
        @media (max-width: 960px) {
          .scene-progress { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
