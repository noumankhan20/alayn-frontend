"use client";

import AnimatedText from "./AnimatedText";

type Availability = "yes" | "no" | "partial";

interface CompareRow {
  feature: string;
  alayn: Availability;
  nory: Availability;
  trail: Availability;
  allGravy: Availability;
}

const ROWS: CompareRow[] = [
  {
    feature: "Employee & shift management",
    alayn: "yes",
    nory: "yes",
    trail: "partial",
    allGravy: "yes",
  },
  {
    feature: "Inventory & stock control",
    alayn: "yes",
    nory: "yes",
    trail: "no",
    allGravy: "no",
  },
  {
    feature: "Dashboard & business analytics",
    alayn: "yes",
    nory: "yes",
    trail: "partial",
    allGravy: "partial",
  },
  {
    feature: "Order management (incl. delivery apps)",
    alayn: "yes",
    nory: "no",
    trail: "no",
    allGravy: "no",
  },
  {
    feature: "Waste management",
    alayn: "yes",
    nory: "yes",
    trail: "no",
    allGravy: "no",
  },
  {
    feature: "Customer + staff feedback & queries",
    alayn: "yes",
    nory: "partial",
    trail: "partial",
    allGravy: "partial",
  },
  {
    feature: "AI insights across every module",
    alayn: "yes",
    nory: "partial",
    trail: "partial",
    allGravy: "partial",
  },
  {
    feature: "Built for India (GST, UPI, Zomato/Swiggy)",
    alayn: "yes",
    nory: "no",
    trail: "no",
    allGravy: "no",
  },
];

function AvailabilityIcon({ value }: { value: Availability }) {
  if (value === "yes") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Yes">
        <circle cx="9" cy="9" r="8.25" stroke="var(--amber)" strokeWidth="1.5" fill="rgba(212,169,106,0.08)" />
        <path
          d="M5.5 9l2.5 2.5 4.5-5"
          stroke="var(--amber)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (value === "partial") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Partial">
        <circle cx="9" cy="9" r="8.25" stroke="var(--muted)" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path
          d="M6 9h6"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="No">
      <circle cx="9" cy="9" r="8.25" stroke="var(--muted)" strokeWidth="1" fill="none" opacity="0.2" />
      <path
        d="M6.5 11.5l5-5M11.5 11.5l-5-5"
        stroke="var(--muted)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

export default function CompareSection() {
  return (
    <section
      className="landing-section"
      style={{ background: "var(--cream)" }}
      aria-labelledby="compare-heading"
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            maxWidth: "560px",
            marginBottom: "56px",
          }}
        >
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
                color: "var(--amber)",
              }}
            >
              <span className="accent-line" />
              How we compare
            </span>
          </AnimatedText>

          <AnimatedText
            as="h2"
            id="compare-heading"
            delay={1}
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.875rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--espresso)",
              marginBottom: "16px",
            }}
          >
            Global tools built for
            <em style={{ fontStyle: "italic", color: "var(--amber-light)" }}>
              {" "}their markets.
            </em>
            <br />
            Alayn built for yours.
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
            Nory, Trail/Fourth and All Gravy are strong products — for the UK and Europe. India's businesses need something different.
          </AnimatedText>
        </div>

        {/* Table */}
        <AnimatedText as="div" delay={2} style={{ overflowX: "auto" }}>
          <table
            className="compare-table"
            style={{
              minWidth: "640px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid var(--border-warm)",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(27, 42, 74, 0.04)" }}>
                <th style={{ width: "36%" }}>Capability</th>
                <th style={{ textAlign: "center", color: "var(--amber)" }}>Alayn</th>
                <th style={{ textAlign: "center" }}>Nory</th>
                <th style={{ textAlign: "center" }}>Trail / Fourth</th>
                <th style={{ textAlign: "center" }}>All Gravy</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={row.feature.includes("India") ? "compare-highlight" : ""}
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(27, 42, 74, 0.02)",
                  }}
                >
                  <td
                    style={{
                      fontWeight: row.feature.includes("India") ? 600 : 400,
                      color: row.feature.includes("India")
                        ? "var(--amber)"
                        : "var(--espresso)",
                    }}
                  >
                    {row.feature}
                  </td>
                  {(["alayn", "nory", "trail", "allGravy"] as const).map(
                    (col) => (
                      <td key={col} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <AvailabilityIcon value={row[col]} />
                        </div>
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </AnimatedText>

        {/* Note */}
        <AnimatedText
          as="p"
          delay={3}
          style={{
            marginTop: "24px",
            fontSize: "0.8125rem",
            color: "var(--muted)",
            opacity: 0.7,
            lineHeight: 1.6,
            maxWidth: "680px",
          }}
        >
          Trail (task management) and Fourth (workforce scheduling) are related products often deployed together. None of these platforms currently offer India-specific features like GST billing, UPI payments, or Zomato/Swiggy integration.
        </AnimatedText>
      </div>
    </section>
  );
}
