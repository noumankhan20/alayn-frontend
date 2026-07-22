"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FieldScene } from "../motion/GlobalField";
import { Assemble, useMagnetic, springSnappy } from "../motion/primitives";

/**
 * Hero for independent restaurants, cafés and cloud kitchens running on
 * notebooks, WhatsApp and memory — matches the vertical scope in
 * VerticalsScene further down the page (restaurants/cafés/QSR/cloud
 * kitchens/bakeries/hotel dining), not narrowed to cafés specifically. Not
 * a shipped screenshot yet, so the product surface below is a single,
 * clearly-scoped mock: swap it for a real screenshot once the pilot build
 * exists. Background is a CSS-only aurora (see .hero-aurora in
 * globals.css) — transform-only animation, no canvas, no WebGL, no
 * per-pixel cost.
 */

const SNAPSHOT = [
  { label: "Orders", value: "128", detail: "synced today", state: "ok" as const },
  { label: "Stock", value: "Low", detail: "1 item flagged before it runs out", state: "attention" as const },
  { label: "Staff", value: "6", detail: "on shift now", state: "ok" as const },
  { label: "Waste", value: "₹340", detail: "tracked this week", state: "ok" as const },
];

function MagneticLink({
  href,
  className,
  id,
  children,
}: {
  href: string;
  className: string;
  id: string;
  children: React.ReactNode;
}) {
  const { ref, x, y } = useMagnetic(0.2);
  return (
    <motion.div style={{ x, y, display: "inline-block" }} transition={springSnappy}>
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} id={id} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function HeroScene() {
  // The syncing row rotates so the panel reads as live without any element
  // actually moving — cheapest possible sense of activity.
  const [syncing, setSyncing] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSyncing((p) => (p + 1) % SNAPSHOT.length), 2400);
    return () => clearInterval(t);
  }, []);

  // The alert card appears a beat after the panel, then stays — it's the
  // proof of the "you always know what needs you" claim.
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowAlert(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <FieldScene
      id="boot"
      domId="scene-boot"
      chaos={0}
      sync={0.25}
      presence={0.25}
      className="hero-section"
      ariaLabel="Alayn"
      style={{
        background: "#FFFFFF",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "clip",
        padding: "150px 24px 110px",
      }}
    >
      {/* Aurora wash — three blurred blobs, transform-only animation */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div className="hero-aurora hero-aurora-a" />
        <div className="hero-aurora hero-aurora-b" />
        <div className="hero-aurora hero-aurora-c" />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
            gap: "72px",
            alignItems: "center",
          }}
        >
          {/* Left — the pitch */}
          <div>
            <Assemble
              as="span"
              style={{
                display: "inline-block",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: "18px",
              }}
            >
              For Restaurants, Cafés &amp; Cloud Kitchens
            </Assemble>

            <Assemble
              as="h1"
              delay={0.06}
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(2.5rem, 5.2vw, 4.2rem)",
                lineHeight: 1.08,
                fontWeight: 800,
                color: "var(--espresso)",
                letterSpacing: "-0.03em",
                marginBottom: "24px",
              }}
            >
              The Intelligent Operating System
              <br />
              <em style={{ fontStyle: "italic", color: "var(--amber)", fontWeight: 400 }}>
                for Hospitality.
              </em>
            </Assemble>

            <Assemble
              as="p"
              delay={0.12}
              style={{
                fontSize: "clamp(1.05rem, 1.5vw, 1.1875rem)",
                lineHeight: 1.65,
                color: "var(--muted)",
                maxWidth: "480px",
                marginBottom: "38px",
              }}
            >
             Orders, inventory, staffing and operations—unified in one intelligent platform with real-time visibility across every location. Built for the standards of modern hospitality, wherever your business grows.
            </Assemble>

            <Assemble
              as="div"
              delay={0.18}
              style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "34px" }}
            >
              <MagneticLink href="/signup" id="cta-hero" className="btn-primary">
                Book a Demonstration
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </MagneticLink>

              <a
                href="#how-it-works"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "var(--espresso)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: 0.7,
                }}
              >
                Explore the Platform
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Assemble>

            <Assemble as="p" delay={0.24} style={{ fontSize: "0.8125rem", color: "var(--muted)", opacity: 0.75, margin: 0 }}>
              We&apos;re  introducing Alayn AI to a select group of forward-thinking organisations. Arrange a demonstration to discover how intelligent automation can transform your operations.            </Assemble>
          </div>

          {/* Right — floating product surface (Stripe pattern).
              MOCK UI — this whole block is the swap point for a real product
              screenshot once the pilot build exists (~2 weeks out). Replace
              the panel's contents with an <Image> of the actual app; keep
              the floating alert card as an annotation over it if it still reads well. */}
          <Assemble as="div" delay={0.16} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "440px" }}>
              {/* Main panel */}
              <div
                style={{
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: "20px",
                  padding: "22px",
                  boxShadow: "0 24px 70px rgba(27,42,74,0.13), 0 2px 8px rgba(27,42,74,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--espresso)" }}>
                    Today
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.6875rem", color: "var(--muted)" }}>
                    <motion.span
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1FA97C" }}
                    />
                    Live
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  {SNAPSHOT.map((row, i) => {
                    const isAttention = row.state === "attention";
                    return (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "11px",
                          background: isAttention ? "rgba(196,30,42,0.06)" : "rgba(244,245,248,0.75)",
                          border: `1px solid ${isAttention ? "rgba(196,30,42,0.18)" : "transparent"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <motion.span
                            animate={syncing === i ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.45 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isAttention ? "var(--amber)" : "var(--espresso)",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--espresso)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {row.label}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                          {isAttention && (
                            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--amber)" }}>
                              {row.detail}
                            </span>
                          )}
                          <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                            {row.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating alert card — the "before it becomes a problem" proof.
                  Sized with min()/clamp() so it never overflows on phones,
                  which is the primary surface this page is opened on. */}
              <AnimatePresence>
                {showAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    style={{
                      position: "absolute",
                      bottom: "clamp(-22px, -4vw, -30px)",
                      left: "clamp(-8px, -3vw, -26px)",
                      width: "min(270px, 78vw)",
                      background: "#FFFFFF",
                      border: "1px solid var(--border-warm)",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      boxShadow: "0 18px 44px rgba(27,42,74,0.16)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--amber)" }} />
                      <span style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--amber)" }}>
                        AI Predictive Autopilot
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--espresso)" }}>
                      Dinner rush forecasted +38%. AI auto-drafted your supplier PO and optimized staff roster for 1-click approval.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Assemble>
        </div>
      </div>
    </FieldScene>
  );
}
