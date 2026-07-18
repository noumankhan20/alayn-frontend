"use client";

import Link from "next/link";
import AnimatedText from "./AnimatedText";

export default function CTASection() {
  return (
    <section
      className="landing-section section-dark noise-overlay"
      aria-labelledby="cta-heading"
      style={{
        padding: "140px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle warm radial at center */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(196, 30, 42, 0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Eyebrow */}
        <AnimatedText as="div" style={{ marginBottom: "24px" }}>
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
            Ready when you are
          </span>
        </AnimatedText>

        <AnimatedText
          as="h2"
          id="cta-heading"
          delay={1}
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(2.25rem, 5.5vw, 4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "var(--cream-light)",
            marginBottom: "24px",
          }}
        >
          Run your business
          <br />
          <em style={{ fontStyle: "italic", color: "var(--thread)" }}>
            with intelligence.
          </em>
        </AnimatedText>

        <AnimatedText
          as="p"
          delay={2}
          style={{
            fontSize: "1.125rem",
            color: "rgba(255, 255, 255, 0.45)",
            lineHeight: 1.65,
            marginBottom: "48px",
            maxWidth: "480px",
            margin: "0 auto 48px",
          }}
        >
          Start free. No credit card required. Your first business location is on us while you're getting started.
        </AnimatedText>

        <AnimatedText
          as="div"
          delay={3}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/signup"
            id="cta-start"
            className="btn-primary-light"
          >
            Start free trial
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            href="/login"
            id="cta-login"
            className="btn-ghost-dark"
          >
            Already have an account
          </Link>
        </AnimatedText>
      </div>
    </section>
  );
}
