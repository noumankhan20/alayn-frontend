"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Sliders, Truck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Stock Items", href: "/inventory", icon: Package },
  { name: "Adjust Stock", href: "/inventory/adjust", icon: Sliders },
  { name: "Procurement & POs", href: "/inventory/procurement", icon: Truck },
  { name: "Waste Management", href: "/inventory/waste", icon: Trash2 },
];

export default function InventoryNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-zinc-200/80 bg-white px-2 sm:px-4 pt-1 shadow-xs overflow-x-auto scrollbar-none">
      <div className="flex space-x-1 sm:space-x-2 whitespace-nowrap">

        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors relative",
                isActive
                  ? "border-[#D3232A] text-[#D3232A]"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#D3232A]" : "text-zinc-400")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
