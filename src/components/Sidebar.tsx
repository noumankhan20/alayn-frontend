"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Store,
  Users, 
  Package,
  UtensilsCrossed,
  ClipboardList, 
  MessageSquare,
  Trash2,
  Settings, 
  HelpCircle, 
  User, 
  Building2, 
  Sparkles,
  Calendar,
  FileText,
  CreditCard,
  ChefHat,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/store/hooks";

type Role = "BUSINESS_OWNER" | "SUPER_ADMIN" | "MANAGER" | "STAFF" | "KITCHEN";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

// 1. BUSINESS_OWNER / SUPER_ADMIN Options
const ownerNavItems: NavItem[] = [
  { name: "Overview", icon: LayoutGrid, href: "/" },
  { name: "Location Manager", icon: Store, href: "/outlets" },
  { name: "Workforce", icon: Users, href: "/workforce" },
  { name: "Smart Inventory", icon: Package, href: "/inventory" },
  { name: "Menu Manager", icon: UtensilsCrossed, href: "/menu" },
  { name: "POS & Operations", icon: ClipboardList, href: "/operations" },
  { name: "Support & Tickets", icon: MessageSquare, href: "/support" },
  { name: "Waste Management", icon: Trash2, href: "/waste" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

// 2. MANAGER Options
const managerNavItems: NavItem[] = [
  { name: "Overview", icon: LayoutGrid, href: "/" },
  { name: "Workforce Directory", icon: Users, href: "/workforce" },
  { name: "Inventory Adjustments", icon: Package, href: "/inventory" },
  { name: "POS & Operations", icon: ClipboardList, href: "/operations" },
  { name: "Support Tickets", icon: MessageSquare, href: "/support" },
  { name: "Waste Logs", icon: Trash2, href: "/waste" },
];

// 3. STAFF Options
const staffNavItems: NavItem[] = [
  { name: "Shift Calendar", icon: Calendar, href: "/workforce" },
  { name: "Leave Request", icon: FileText, href: "/workforce/leaves" },
  { name: "POS Terminal", icon: CreditCard, href: "/operations" },
  { name: "Attendance Logs", icon: Clock, href: "/workforce/attendance" },
];

// 4. KITCHEN Options
const kitchenNavItems: NavItem[] = [
  { name: "Shift Calendar", icon: Calendar, href: "/workforce" },
  { name: "Leave Request", icon: FileText, href: "/workforce/leaves" },
  { name: "Kitchen Dispatch Board", icon: ChefHat, href: "/operations" },
  { name: "Attendance Logs", icon: Clock, href: "/workforce/attendance" },
];

const bottomNavItems: NavItem[] = [
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Organization", icon: Building2, href: "/organization" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const role: Role = (user?.role as Role) || "BUSINESS_OWNER";

  let navItems = ownerNavItems;
  if (role === "MANAGER") navItems = managerNavItems;
  else if (role === "STAFF") navItems = staffNavItems;
  else if (role === "KITCHEN") navItems = kitchenNavItems;

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
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
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
