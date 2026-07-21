"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  Package,
  Lightbulb, 
  Settings, 
  HelpCircle, 
  User, 
  Building2, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", icon: LayoutGrid, href: "/dashboard" },
  { name: "Performance", icon: TrendingUp, href: "/performance" },
  { name: "Workforce", icon: Users, href: "/workforce" },
  { name: "Operations", icon: ClipboardList, href: "/operations" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Insights", icon: Lightbulb, href: "/insights" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

const bottomNavItems = [
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Organization", icon: Building2, href: "/organization" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-[#0B1221] text-zinc-400">
      {/* Logo Section */}
      <div className="flex flex-col px-4 pt-8 pb-4">
        <div className="w-52">
          <Image 
            src="/blackalaynlogo.png" 
            alt="ALAYN Logo" 
            width={208} 
            height={53} 
            className="h-auto w-full object-contain"
            style={{ height: "auto" }}
            priority
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D3232A] rounded-r-sm" />
              )}
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D3232A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b01e23] transition-colors">
          <Sparkles className="h-4 w-4" />
          Ask Alayn
        </button>

        <nav className="space-y-1 mt-6">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-white"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
