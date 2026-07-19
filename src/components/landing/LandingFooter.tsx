"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
  return (
    <footer
      style={{
        background: "var(--espresso)",
        borderTop: "1px solid rgba(249, 246, 241, 0.06)",
        padding: "48px 0 40px",
      }}
      aria-label="Site footer"
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        {/* Logo + tagline */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Image
              src="/blackalaynlogo.png"
              alt="Alayn Logo"
              width={256}
              height={64}
              style={{ height: "64px", width: "auto" }}
              className="w-auto object-contain"
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              color: "rgba(249, 246, 241, 0.6)",
              lineHeight: 1.5,
            }}
          >
            The operating system for Indian businesses.
          </p>
        </div>

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
          aria-label="Footer navigation"
        >
          {[
            { href: "/login", label: "Log in" },
            { href: "/signup", label: "Sign up" },
            { href: "#how-it-works", label: "How it works" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="footer-link"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: "rgba(249, 246, 241, 0.5)",
            width: "100%",
            borderTop: "1px solid rgba(249, 246, 241, 0.06)",
            paddingTop: "24px",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} Alayn. Built for India.
        </p>
      </div>
    </footer>
  );
}
