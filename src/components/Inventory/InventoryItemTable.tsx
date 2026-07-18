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
              className={`border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors ${
                idx % 2 === 0 ? "" : "bg-zinc-50/30"
              }`}
            >
              <td className="px-5 py-3">
                <p className="font-semibold text-zinc-900 leading-tight">{item.name}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{item.sku}</p>
              </td>
              <td className="px-5 py-3">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                  {item.category}
                </span>
              </td>
              <td className="px-5 py-3 text-right text-zinc-700 tabular-nums">
                ₹{(item.unitCostPaise / 100).toFixed(2)}
              </td>
              <td className="px-5 py-3 text-center">
                <span className={`text-base font-bold tabular-nums ${isLow ? "text-amber-600" : "text-zinc-800"}`}>
                  {item.currentStock}
                </span>
                <span className="text-[11px] text-zinc-400 ml-1">{item.unit}</span>
              </td>
              <td className="px-5 py-3 text-center text-zinc-500 text-xs tabular-nums">
                {item.reorderThreshold} {item.unit}
              </td>
              <td className="px-5 py-3 text-center">
                {isLow ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> Low
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
                    className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-[#D3232A] hover:text-white transition-colors"
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
