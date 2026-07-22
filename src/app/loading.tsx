"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import FullDashboardSkeleton from "@/components/dashboard/FullDashboardSkeleton";

export default function Loading() {
  const pathname = usePathname();

  // Public pages (landing, login, signup) use the minimalist Facebook-style light brand loader.
  // All protected routes (/dashboard, /workforce, /inventory, /pos, etc.) use FullDashboardSkeleton.
  const isPublicPage = !pathname || pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (!isPublicPage) {
    return <FullDashboardSkeleton />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#F4F6F9] select-none">
      {/* Top spacer for vertical balance */}
      <div className="h-12 w-full" />

      {/* Center Brand Emblem — Minimalist Facebook Style */}
      <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-md shadow-slate-200/70 border border-slate-100 p-3">
          <Image
            src="/justlogo.png"
            alt="Alayn Emblem"
            width={72}
            height={72}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>
      </div>

      {/* Bottom Branding — Facebook 'from Meta' Style */}
      <div className="pb-10 flex flex-col items-center gap-0.5 text-center font-sans">
        <span className="text-[11px] font-medium text-slate-400 tracking-wider">from</span>
        <span className="text-xs font-extrabold tracking-widest text-[#D3232A] uppercase">
          ALAYN AI
        </span>
      </div>
    </div>
  );
}
