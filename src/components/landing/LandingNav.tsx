"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMagnetic, springSnappy } from "./motion/primitives";
import { useAppSelector, useAppDispatch } from "@/redux/store/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/slices/authApiSlice";
import { LayoutGrid, User, LogOut, ChevronDown } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { ref: signupRef, x, y } = useMagnetic(0.2);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = mounted && user?.name ? user.name.charAt(0).toUpperCase() : "O";

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      setDropdownOpen(false);
      window.location.reload();
    }
  };

  return (
    <nav
      className={`landing-nav ${scrolled ? "scrolled" : ""}`}
      aria-label="Main navigation"
    >
      <div
        className="nav-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Brand logo */}
        <Link href="/" className="nav-brand flex items-center">
          <Image
            src="/gptlogo.png"
            alt="Alayn — AI Operating System for Hospitality"
            width={480}
            height={111}
            sizes="(max-width: 640px) 180px, 320px"
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
          {!mounted ? (
            <Skeleton width={110} height={38} borderRadius={20} />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full bg-white/90 border border-zinc-200/80 px-3 py-1.5 shadow-sm hover:bg-zinc-50 transition-all duration-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D3232A] text-xs font-bold text-white shadow-sm" suppressHydrationWarning>
                  {initial}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-zinc-800" suppressHydrationWarning>
                  {user.name || "Owner"}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900 truncate" suppressHydrationWarning>{user.name}</p>
                    <p className="text-[11px] text-zinc-400 font-medium truncate" suppressHydrationWarning>{user.email}</p>
                    <span className="inline-block mt-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#D3232A]">
                      {user.role || "BUSINESS_OWNER"}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4 text-[#D3232A]" />
                    Go to Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                id="nav-login"
                className="nav-login-btn"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1A1D24",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  transition: "background-color 0.15s ease",
                }}
              >
                Log in
              </Link>
              <motion.div
                ref={signupRef as any}
                animate={{ x, y } as any}
                transition={springSnappy}
                style={{ display: "inline-block" }}
              >

                <Link
                  href="/signup"
                  id="nav-get-started"
                  className="nav-signup-btn"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    backgroundColor: "#1A1D24",
                    textDecoration: "none",
                    padding: "8px 18px",
                    borderRadius: "20px",
                    display: "inline-block",
                    transition: "transform 0.15s ease, background-color 0.15s ease",
                  }}
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
