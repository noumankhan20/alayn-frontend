"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FieldScene } from "../motion/GlobalField";
import { Assemble, useMagnetic, springSnappy } from "../motion/primitives";

function MagneticLink({ href, className, id, children }: { href: string; className: string; id: string; children: React.ReactNode }) {
  const { ref, x, y } = useMagnetic(0.25);
  return (
    <motion.div style={{ x, y }} transition={springSnappy}>
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} id={id} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function WaitingScene() {
  return (
    <FieldScene
      id="waiting"
      domId="scene-waiting"
      chaos={0.02}
      sync={0.35}
      presence={0.45}
      className="landing-section section-dark noise-overlay"
      style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}
      ariaLabel="Get started"
    >
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <Assemble
          as="h2"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(2.25rem, 5.5vw, 4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "var(--cream-light)",
            marginBottom: "20px",
          }}
        >
          The AI Operating System for
          <br />
          <em style={{ fontStyle: "italic", color: "var(--thread)" }}>Modern Business.</em>
        </Assemble>

        <Assemble
          as="p"
          delay={0.1}
          style={{
            fontSize: "1.125rem",
            color: "rgba(255, 255, 255, 0.64)",
            lineHeight: 1.65,
            maxWidth: "440px",
            margin: "0 auto 44px",
          }}
        >
          Unify your teams, automate workflows, and accelerate growth-all in one platform.
        </Assemble>

        <Assemble as="div" delay={0.2} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <MagneticLink href="/signup" id="cta-start" className="btn-primary-light">
            Get Started
          </MagneticLink>
          <Link href="/login" id="cta-login" className="btn-ghost-dark">
            I have an account
          </Link>
        </Assemble>
      </div>
    </FieldScene>
  );
}
