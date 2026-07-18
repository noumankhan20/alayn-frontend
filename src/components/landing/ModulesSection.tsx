"use client";

import AnimatedText from "./AnimatedText";

const MODULE_ICONS: Record<string, string> = {
  Staff: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0",
  Inventory: "M8 2l5 3v6l-5 3-5-3V5l5-3zm0 0v12M3 5l5 3 5-3",
  Orders: "M4 3h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4h4m-4 3h4m-4 3h2",
  Analytics: "M3 13V9m4 4V5m4 4V2m2 11H2",
  Waste: "M4 6h8m-4-2h2M5 6l.7 7h4.6L11 6M8 9v3",
  Feedback: "M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8L5 14v-3H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
};

const MODULES = [
  {
    tag: "Staff",
    headline: "Every shift, every employee, every decision — connected.",
    body: "Digital profiles, attendance, shift scheduling, leave requests and performance notes — all in one place. No WhatsApp chains.",
  },
  {
    tag: "Inventory",
    headline: "Know where every rupee of stock goes before it disappears.",
    body: "Auto-deduction on every sale. Low-stock alerts before service. AI demand forecasting so you order exactly what you need.",
  },
  {
    tag: "Orders",
    headline: "Counter, table, Zomato, Swiggy — one screen, zero chaos.",
    body: "GST-ready billing. UPI, card, cash and split payments. Kitchen display updates in real time. Delivery orders land automatically.",
  },
  {
    tag: "Analytics",
    headline: "Wake up already knowing what the day will bring.",
    body: "Net sales, gross profit, best sellers, forecast accuracy — all visible before your first cup of coffee. One-tap reports for investors.",
  },
  {
    tag: "Waste",
    headline: "See waste as the rupee number hitting your margin.",
    body: "Staff log waste in seconds. AI spots which shift is generating the most, and recommends exact prep reductions with rupee savings attached.",
  },
  {
    tag: "Feedback",
    headline: "Turn every complaint into action before it costs a customer.",
    body: "Customer feedback via QR codes. Staff queries with ticket tracking. AI sentiment analysis flags dissatisfaction before ratings drop.",
  },
];

export default function ModulesSection() {
  return (
    <section
      className="landing-section"
      style={{ background: "var(--cream-light)" }}
      aria-labelledby="modules-heading"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 72px" }}>
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
              What you get
            </span>
          </AnimatedText>

          <AnimatedText
            as="h2"
            id="modules-heading"
            delay={1}
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(1.875rem, 4.5vw, 3rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--espresso)",
              marginBottom: "20px",
            }}
          >
            Built around
            <em style={{ fontStyle: "italic", color: "var(--amber-light)" }}>
              {" "}outcomes,
            </em>
            <br />
            not features.
          </AnimatedText>

          <AnimatedText
            as="p"
            delay={2}
            style={{
              fontSize: "1.0625rem",
              color: "var(--muted)",
              lineHeight: 1.65,
            }}
          >
            Every module was designed around the real decisions a business owner makes every single day.
          </AnimatedText>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border-warm)",
            background: "var(--border-warm)",
          }}
          className="modules-grid"
        >
          {MODULES.map((mod, i) => (
            <AnimatedText
              key={mod.tag}
              as="div"
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className="value-card"
              style={{
                borderRadius: 0,
                background: "#FFFFFF",
                border: "none",
                padding: "36px 32px",
              }}
            >
              {/* SVG Icon */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                border: "1px solid rgba(196, 30, 42, 0.15)",
                background: "rgba(196, 30, 42, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d={MODULE_ICONS[mod.tag]}
                    stroke="var(--amber)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  marginBottom: "10px",
                }}
              >
                {mod.tag}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  lineHeight: 1.4,
                  color: "var(--espresso)",
                  marginBottom: "12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {mod.headline}
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.6 }}>
                {mod.body}
              </p>
            </AnimatedText>
          ))}
        </div>

        {/* India badge — no emoji */}
        <AnimatedText
          as="div"
          delay={3}
          style={{ marginTop: "48px", textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              borderRadius: "100px",
              border: "1px solid var(--border-warm)",
              background: "rgba(196, 30, 42, 0.04)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--amber)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--espresso)",
                fontWeight: 500,
              }}
            >
              Built for India — GST-ready billing · UPI payments · Zomato & Swiggy integration
            </span>
          </div>
        </AnimatedText>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .modules-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
