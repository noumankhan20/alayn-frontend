"use client";

import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  iconCls: string;
  label: string;
  value: string;
  sub?: string;
  pulse?: boolean;
}

export default function InventoryStatCard({
  icon,
  iconCls,
  label,
  value,
  sub,
  pulse = false,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
      <div className={`rounded-lg p-2.5 ${iconCls} ${pulse ? "animate-pulse" : ""}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
