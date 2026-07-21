"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMagnetic, springSnappy } from "./motion/primitives";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { ref: signupRef, x, y } = useMagnetic(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`landing-nav ${scrolled ? "scrolled" : ""}`}
      aria-label="Main navigation"
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
          aria-label="Alayn home"
        >
          <Image
            src="/gptlogo.png"
            alt="Alayn — AI Operating System for Hospitality"
            width={1280}
            height={297}
           
            style={{ 
              height: "56px", 
              width: "auto",
              transform: "scale(1.8)",
              transformOrigin: "left center"
            }}
            className="w-auto object-contain"
            priority
          />
        </Link>

        {/* Right nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/login"
            id="nav-login"
            className="nav-login-btn"
            style={{
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--espresso)",
              textDecoration: "none",
              borderRadius: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            Log in
          </Link>

          <motion.div style={{ x, y }} transition={springSnappy}>
            <Link
              ref={signupRef as React.Ref<HTMLAnchorElement>}
              href="/signup"
              id="nav-signup"
              className="btn-primary"
              style={{
                padding: "9px 20px",
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Get started
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
