"use client";

import AnimatedText from "./AnimatedText";

const PAIN_POINTS = [
  {
    number: "01",
    headline: "Stock disappears before you notice.",
    body: "Ingredients expire, go missing, or run out mid-service — because no system is watching. You find out when a customer order can't be fulfilled.",
  },
  {
    number: "02",
    headline: "Staff issues eat your hours.",
    body: "Shift scheduling on WhatsApp. Attendance disputes at month-end. Leave requests you can't track. Every manual process costs you focus and money.",
  },
  {
    number: "03",
    headline: "You're always reading yesterday's numbers.",
    body: "The café closes. You tally up. You wonder why margins slipped. By then, the waste has happened, the shift has ended, the opportunity is gone.",
  },
];

export default function ChaosSection() {
  return (
    <section
      className="landing-section section-dark noise-overlay"
      id="how-it-works"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Section label */}
        <AnimatedText as="div" style={{ marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(196, 30, 42, 0.8)",
            }}
          >
            <span className="accent-line" />
            The problem
          </span>
        </AnimatedText>

        {/* Main headline */}
        <AnimatedText
          as="h2"
          delay={1}
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            maxWidth: "680px",
            marginBottom: "20px",
          }}
        >
          Right now, your café runs on guesswork.
        </AnimatedText>

        <AnimatedText
          as="p"
          delay={2}
          style={{
            fontSize: "1.0625rem",
            color: "rgba(255, 255, 255, 0.45)",
            maxWidth: "520px",
            lineHeight: 1.65,
            marginBottom: "80px",
          }}
        >
          Five disconnected tools. Zero real-time visibility. One owner juggling everything at once.
        </AnimatedText>

        {/* Pain points grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {PAIN_POINTS.map((point, i) => (
            <AnimatedText
              key={point.number}
              as="div"
              delay={(i + 1) as 1 | 2 | 3}
              style={{
                padding: "40px 36px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRight: i < PAIN_POINTS.length - 1 ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "var(--amber)",
                  marginBottom: "16px",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                {point.number}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  marginBottom: "12px",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {point.headline}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(255, 255, 255, 0.4)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {point.body}
              </p>
            </AnimatedText>
          ))}
        </div>
      </div>
    </section>
  );
}
