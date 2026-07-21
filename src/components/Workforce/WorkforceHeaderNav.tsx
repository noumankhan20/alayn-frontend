"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, CalendarOff, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Staff Directory", href: "/workforce", icon: Users },
  { name: "Shift Scheduler", href: "/workforce/scheduler", icon: Calendar },
  { name: "Leave Approvals", href: "/workforce/leaves", icon: CalendarOff },
  { name: "Attendance Kiosk", href: "/attendance-terminal", icon: MonitorSmartphone },
];

export default function WorkforceHeaderNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-[#D3232A] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
