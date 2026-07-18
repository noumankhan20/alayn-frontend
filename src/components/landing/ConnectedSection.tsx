"use client";

import AnimatedText from "./AnimatedText";

const MODULES = [
  {
    name: "Staff",
    outcome: "Every shift, every employee, every decision — connected.",
    color: "#C41E2A",
    angle: -90,
    abbr: "S",
    // Person icon path
    iconPath: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0",
  },
  {
    name: "Inventory",
    outcome: "Know where every rupee of stock goes before it disappears.",
    color: "#1B2A4A",
    angle: -30,
    abbr: "I",
    // Box icon path
    iconPath: "M8 2l5 3v6l-5 3-5-3V5l5-3zm0 0v12M3 5l5 3 5-3",
  },
  {
    name: "Orders",
    outcome: "Counter, table, Zomato, Swiggy — one order screen, zero chaos.",
    color: "#C41E2A",
    angle: 30,
    abbr: "O",
    // Receipt icon path
    iconPath: "M4 3h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4h4m-4 3h4m-4 3h2",
  },
  {
    name: "Analytics",
    outcome: "Wake up already knowing what the day will bring.",
    color: "#1B2A4A",
    angle: 90,
    abbr: "A",
    // Bar chart icon path
    iconPath: "M3 13V9m4 4V5m4 4V2m2 11H2",
  },
  {
    name: "Waste",
    outcome: "See waste as the rupee number hitting your margin.",
    color: "#C41E2A",
    angle: 150,
    abbr: "W",
    // Trash icon path
    iconPath: "M4 6h8m-4-2h2M5 6l.7 7h4.6L11 6M8 9v3",
  },
  {
    name: "Feedback",
    outcome: "Turn every complaint into action before it costs a customer.",
    color: "#1B2A4A",
    angle: -150,
    abbr: "F",
    // Chat bubble path
    iconPath: "M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8L5 14v-3H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
  },
];

const R = 155;

export default function ConnectedSection() {
  return (
    <section
      className="landing-section"
      style={{ background: "var(--cream)" }}
      aria-labelledby="connected-heading"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ maxWidth: "600px", marginBottom: "80px" }}>
          <AnimatedText as="div" style={{ marginBottom: "16px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--amber)",
              }}
            >
              <span className="accent-line" />
              Everything connected
            </span>
          </AnimatedText>

          <AnimatedText
            as="h2"
            id="connected-heading"
            delay={1}
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--espresso)",
              marginBottom: "20px",
            }}
          >
            Six parts.
            <br />
            <em style={{ fontStyle: "italic", color: "var(--amber-light)" }}>
              One living system.
            </em>
          </AnimatedText>

          <AnimatedText
            as="p"
            delay={2}
            style={{
              fontSize: "1.0625rem",
              color: "var(--muted)",
              lineHeight: 1.65,
              maxWidth: "480px",
            }}
          >
            Alayn connects your entire business operation into a single platform — not just data stored in one place, but a system that thinks across every part of your business.
          </AnimatedText>
        </div>

        {/* Two-column: orbit + module list */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="connected-grid"
        >
          {/* Orbit diagram */}
          <AnimatedText
            as="div"
            delay={1}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <svg
              viewBox="-220 -220 440 440"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
              aria-hidden="true"
            >
              {/* Orbit ring */}
              <circle
                cx="0" cy="0" r={R}
                fill="none"
                stroke="var(--border-warm)"
                strokeWidth="1"
                strokeDasharray="3 6"
                className="orbit-line"
              />

              {/* Connection lines */}
              {MODULES.map((mod) => {
                const rad = (mod.angle * Math.PI) / 180;
                const x = Math.cos(rad) * R;
                const y = Math.sin(rad) * R;
                return (
                  <line
                    key={mod.name}
                    x1={x} y1={y} x2="0" y2="0"
                    stroke={mod.color}
                    strokeWidth="0.75"
                    opacity="0.35"
                  />
                );
              })}

              {/* Center node */}
              <circle cx="0" cy="0" r="34" fill="var(--espresso)" />
              <text
                x="0" y="2"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontFamily="var(--font-playfair), Georgia, serif"
                fontWeight="600"
                letterSpacing="-0.5"
              >
                Alayn
              </text>

              {/* Module nodes */}
              {MODULES.map((mod) => {
                const rad = (mod.angle * Math.PI) / 180;
                const x = Math.cos(rad) * R;
                const y = Math.sin(rad) * R;
                return (
                  <g key={mod.name}>
                    <circle
                      cx={x} cy={y} r="26"
                      fill="#FFFFFF"
                      stroke={mod.color}
                      strokeWidth="1.25"
                    />
                    {/* Module initial letter */}
                    <text
                      x={x} y={y - 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={mod.color}
                      fontSize="10"
                      fontFamily="var(--font-outfit), sans-serif"
                      fontWeight="700"
                    >
                      {mod.abbr}
                    </text>
                    <text
                      x={x} y={y + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--muted)"
                      fontSize="6.5"
                      fontFamily="var(--font-outfit), sans-serif"
                      fontWeight="500"
                    >
                      {mod.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </AnimatedText>

          {/* Module list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {MODULES.map((mod, i) => (
              <AnimatedText
                key={mod.name}
                as="div"
                delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
                style={{
                  padding: "20px 0",
                  borderBottom: i < MODULES.length - 1 ? "1px solid var(--border-warm)" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                {/* SVG icon */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    border: `1px solid ${mod.color}30`,
                    background: `${mod.color}08`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d={mod.iconPath}
                      stroke={mod.color}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: mod.color,
                      opacity: 0.8,
                      marginBottom: "4px",
                    }}
                  >
                    {mod.name}
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--espresso)",
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {mod.outcome}
                  </p>
                </div>
              </AnimatedText>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .connected-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
