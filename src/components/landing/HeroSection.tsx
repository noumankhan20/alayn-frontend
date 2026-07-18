"use client";

import Link from "next/link";
import ThreadCanvas from "./ThreadCanvas";
import AnimatedText from "./AnimatedText";

const THREAD_LABELS = [
  { label: "Orders", x: "6%", y: "22%" },
  { label: "Inventory", x: "88%", y: "16%" },
  { label: "Staff", x: "3%", y: "62%" },
  { label: "Waste", x: "91%", y: "68%" },
  { label: "Feedback", x: "22%", y: "92%" },
  { label: "Analytics", x: "72%", y: "92%" },
];

export default function HeroSection() {
  return (
    <section
      className="hero-section"
      aria-label="Hero"
      id="hero"
      style={{ background: "var(--cream)" }}
    >
      {/* Animated thread canvas */}
      <ThreadCanvas />

      {/* Thread labels — subtle ambient text */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {THREAD_LABELS.map(({ label, x, y }) => (
          <span
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--amber)",
              opacity: 0.5,
              fontFamily: "var(--font-outfit), sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Center content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "820px",
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          paddingTop: "80px",
        }}
      >
        {/* Eyebrow */}
       

        {/* Headline */}
        <AnimatedText
          as="h1"
          className="hero-headline"
          delay={1}
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            marginBottom: "24px",
          }}
        >
          The operating system
          <br />
          <em
            style={{
              fontStyle: "italic",
              color: "var(--amber-light)",
              fontFamily: "var(--font-playfair), Georgia, serif",
            }}
          >
            your business has been waiting for.
          </em>
        </AnimatedText>

        {/* Sub */}
        <AnimatedText
          as="p"
          delay={2}
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.1875rem)",
            lineHeight: 1.65,
            color: "var(--muted)",
            maxWidth: "560px",
            margin: "0 auto 48px",
            fontWeight: 400,
          }}
        >
          Six moving parts. One intelligent platform.
          <br />
          Staff, stock, orders, waste, analytics and feedback — all connected.
        </AnimatedText>

        {/* CTAs */}
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
          <Link href="/signup" className="btn-primary" id="hero-cta-signup" style={{ textDecoration: "none", fontSize: "1rem", padding: "16px 32px" }}>
            Start free trial
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            className="btn-ghost"
            id="hero-cta-learn"
            style={{ textDecoration: "none", fontSize: "1rem", padding: "15px 32px" }}
          >
            See how it works
          </a>
        </AnimatedText>
        {/* Scroll indicator */}
        <div
          style={{
            marginTop: "64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
          aria-hidden="true"
        >
          <span
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              opacity: 0.5,
              fontWeight: 500,
            }}
          >
            Scroll
          </span>
          <div className="scroll-indicator">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4v12M6 12l4 4 4-4"
                stroke="var(--amber)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
