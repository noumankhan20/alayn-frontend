"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedText from "./AnimatedText";

const BRIEFING_LINES = [
  {
    label: "Sales",
    text: "Sales up ₹18,400 vs last Tuesday — cold coffee driving 34% of morning revenue.",
    color: "rgba(196, 30, 42, 0.9)",
  },
  {
    label: "Stock",
    text: "Oat milk will run out by 3 PM if current pace holds. Reorder recommended.",
    color: "rgba(170, 30, 30, 0.85)",
  },
  {
    label: "Staff",
    text: "Evening shift is 1 person short. Arjun has history of being available. Contact him.",
    color: "rgba(212, 55, 55, 0.9)",
  },
  {
    label: "Waste",
    text: "Waste cost ₹2,140 yesterday — 60% from the morning prep shift. Pattern repeating.",
    color: "rgba(196, 30, 42, 0.8)",
  },
];

function TypewriterLine({
  text,
  label,
  color,
  active,
}: {
  text: string;
  label: string;
  color: string;
  active: boolean;
}) {
  const [displayed, setDisplayed] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    setDisplayed("");
    if (!active) return;

    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        timeoutRef.current = setTimeout(tick, 22);
      }
    };
    timeoutRef.current = setTimeout(tick, 200);
    return () => clearTimeout(timeoutRef.current);
  }, [active, text]);

  return (
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        opacity: active ? 1 : 0.35,
        transition: "opacity 0.5s ease",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color,
          marginBottom: "6px",
          fontFamily: "var(--font-outfit), sans-serif",
        }}
      >
        {label}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: "0.9375rem",
          color: "rgba(255, 255, 255, 0.8)",
          lineHeight: 1.55,
          minHeight: "22px",
        }}
      >
        {active ? displayed : text}
        {active && displayed.length < text.length && (
          <span className="typewriter-cursor" style={{ color, marginLeft: "1px" }}>
            |
          </span>
        )}
      </p>
    </div>
  );
}

export default function AISection() {
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    const avgDuration = 2800;
    const timer = setInterval(() => {
      setActiveLine((prev) => (prev + 1) % BRIEFING_LINES.length);
    }, avgDuration);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="landing-section section-dark noise-overlay"
      aria-labelledby="ai-heading"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="ai-grid"
        >
          {/* Left: copy */}
          <div>
            <AnimatedText as="div" style={{ marginBottom: "16px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(196, 30, 42, 0.75)",
                }}
              >
                <span className="accent-line" />
                The AI layer
              </span>
            </AnimatedText>

            <AnimatedText
              as="h2"
              id="ai-heading"
              delay={1}
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.875rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--cream-light)",
                marginBottom: "20px",
              }}
            >
              Wake up already knowing
              <br />
              <em style={{ fontStyle: "italic", color: "var(--thread)" }}>
                what needs your attention.
              </em>
            </AnimatedText>

            <AnimatedText
              as="p"
              delay={2}
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255, 255, 255, 0.45)",
                lineHeight: 1.65,
                maxWidth: "440px",
                marginBottom: "40px",
              }}
            >
              Every morning, Alayn delivers a plain-English briefing across your entire operation. Not raw numbers — actual insight. What changed, what caused it, and what to do next.
            </AnimatedText>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                "Daily AI briefing across all modules",
                "Cross-module root-cause analysis",
                "Ask questions in plain language",
                "Learns from your business's own patterns",
              ].map((item, i) => (
                <AnimatedText
                  key={item}
                  as="div"
                  delay={(i + 2) as 2 | 3 | 4 | 5}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.9375rem",
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "rgba(196, 30, 42, 0.12)",
                      border: "1px solid rgba(196, 30, 42, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="rgba(196, 30, 42, 0.9)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </AnimatedText>
              ))}
            </div>
          </div>

          {/* Right: animated morning briefing card */}
          <AnimatedText
            as="div"
            delay={2}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              background: "rgba(255, 255, 255, 0.03)",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(196, 30, 42, 0.7)",
                    marginBottom: "4px",
                  }}
                >
                  Good morning, Aryan
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255, 255, 255, 0.45)",
                  }}
                >
                  Today's briefing · All locations
                </span>
              </div>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "rgba(196, 30, 42, 0.8)",
                  boxShadow: "0 0 8px rgba(196, 30, 42, 0.4)",
                  animation: "orbit-pulse 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Briefing lines */}
            {BRIEFING_LINES.map((line, i) => (
              <TypewriterLine
                key={line.label}
                label={line.label}
                text={line.text}
                color={line.color}
                active={activeLine === i}
              />
            ))}

            {/* Card footer */}
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "rgba(255, 255, 255, 0.28)",
                }}
              >
                Ask Alayn anything...
              </span>
            </div>
          </AnimatedText>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ai-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
