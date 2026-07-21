"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { InventoryItem } from "@/lib/api";

interface Props {
  items: InventoryItem[];
  onAdjust: (item: InventoryItem) => void;
  canManage: boolean;
}

export default function InventoryItemTable({ items, onAdjust, canManage }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 h-56 text-zinc-400">
        <p className="font-medium text-zinc-600 text-sm">No items match your filters</p>
        <p className="text-xs">Try a different search or category, or add a new item.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-zinc-50 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
          <th className="px-5 py-3">Item</th>
          <th className="px-5 py-3">Category</th>
          <th className="px-5 py-3 text-right">Cost / Unit</th>
          <th className="px-5 py-3 text-center">In Stock</th>
          <th className="px-5 py-3 text-center">Reorder At</th>
          <th className="px-5 py-3 text-center">Status</th>
          {canManage && <th className="px-5 py-3 text-right">Action</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => {
          const isLow = item.currentStock <= item.reorderThreshold;
          return (
            <tr
              key={item.id}
              className={`border-b border-zinc-100 transition-colors ${
                isLow
                  ? "bg-red-50/80 hover:bg-red-100/70 border-l-4 border-l-red-500"
                  : idx % 2 === 0
                  ? "hover:bg-zinc-50/70"
                  : "bg-zinc-50/30 hover:bg-zinc-50/70"
              }`}
            >
              <td className="px-5 py-3">
                <p className={`font-semibold leading-tight ${isLow ? "text-red-950" : "text-zinc-900"}`}>{item.name}</p>
                <p className={`text-[11px] font-mono mt-0.5 ${isLow ? "text-red-600" : "text-zinc-400"}`}>{item.sku}</p>
              </td>
              <td className="px-5 py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isLow ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"}`}>
                  {item.category}
                </span>
              </td>
              <td className="px-5 py-3 text-right text-zinc-700 tabular-nums">
                ₹{(item.unitCostPaise / 100).toFixed(2)}
              </td>
              <td className="px-5 py-3 text-center">
                <span className={`text-base font-bold tabular-nums ${isLow ? "text-red-600 animate-pulse" : "text-zinc-800"}`}>
                  {item.currentStock}
                </span>
                <span className={`text-[11px] ml-1 ${isLow ? "text-red-600 font-semibold" : "text-zinc-400"}`}>{item.unit}</span>
              </td>
              <td className="px-5 py-3 text-center text-zinc-500 text-xs tabular-nums">
                {item.reorderThreshold} {item.unit}
              </td>
              <td className="px-5 py-3 text-center">
                {isLow ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700 shadow-xs">
                    <AlertTriangle className="h-3 w-3 text-red-600" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> OK
                  </span>
                )}
              </td>
              {canManage && (
                <td className="px-5 py-3 text-right">
                  <button
                    id={`adjust-btn-${item.id}`}
                    onClick={() => onAdjust(item)}
                    className="rounded-md bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-[#D3232A] hover:text-white hover:border-[#D3232A] transition-colors shadow-xs"
                  >
                    Adjust
                  </button>
                </td>
              )}
            </tr>
          );
        })}

      </tbody>
    </table>
  );
}
