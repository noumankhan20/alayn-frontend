"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import FullDashboardSkeleton from "@/components/dashboard/FullDashboardSkeleton";

export default function Loading() {
  const pathname = usePathname();

  // Public pages (landing, login, signup) use the neutral full-screen brand loader.
  // All protected routes (/dashboard, /workforce, /inventory, /pos, etc.) use FullDashboardSkeleton (Sidebar + Header + Content).
  const isPublicPage = !pathname || pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (!isPublicPage) {
    return <FullDashboardSkeleton />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A] text-white">
      {/* Top Animated Loading Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#D3232A]/20 overflow-hidden">
        <div className="h-full bg-[#D3232A] animate-pulse w-full origin-left" />
      </div>

      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-[#D3232A]/10 animate-ping absolute" />
          <Image
            src="/gptlogo.png"
            alt="Alayn Logo"
            width={160}
            height={40}
            className="h-10 w-auto object-contain relative z-10"
            priority
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <div className="h-2 w-2 rounded-full bg-[#D3232A] animate-bounce" />
          <span>Loading Alayn...</span>
        </div>
      </div>
    </div>
  );
}
