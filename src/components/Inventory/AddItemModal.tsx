"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { createInventoryItem, InventoryItem } from "@/lib/api";

type NewItem = Omit<InventoryItem, "id" | "currentStock" | "createdAt">;

const EMPTY: NewItem = {
  name: "",
  sku: "",
  category: "",
  unit: "",
  reorderThreshold: 0,
  unitCostPaise: 0,
};

interface Props {
  outletId: string;
  onCreated: (item: InventoryItem) => void;
  onClose: () => void;
  isDemo?: boolean;
}

export default function AddItemModal({ outletId, onCreated, onClose, isDemo }: Props) {
  const [form, setForm]     = useState<NewItem>({ ...EMPTY });
  const [costText, setCostText] = useState(""); // raw rupees text while typing
  const [error, setError]   = useState<string | null>(null);
  const [busy, setBusy]     = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first field on open; Escape closes
  useEffect(() => {
    firstInputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Convert cost text → paise on submit (not while typing)
    const rupeesNum = parseFloat(costText);
    if (!Number.isFinite(rupeesNum) || rupeesNum <= 0) {
      setError("Please enter a valid unit cost greater than zero.");
      return;
    }
    const unitCostPaise = Math.round(rupeesNum * 100);

    setBusy(true);
    try {
      // Demo mode: create item locally without backend
      if (isDemo || outletId.startsWith("demo-")) {
        const demoItem: InventoryItem = {
          ...form,
          unitCostPaise,
          id: `demo-${Date.now()}`,
          currentStock: 0,
        };
        onCreated(demoItem);
        return;
      }
      const res = await createInventoryItem(outletId, { ...form, unitCostPaise });
      if (!res.ok) { setError(res.error ?? "Failed to create item."); return; }
      onCreated(res.item!);
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof NewItem) => (value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-title"
      className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <h2 id="add-item-title" className="text-base font-bold text-zinc-900">
          Add New Item
        </h2>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
        <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="item-name" className="field-label">Item Name</label>
            <input
              ref={firstInputRef}
              id="item-name"
              required
              type="text"
              placeholder="e.g. Whole Milk"
              className="input"
              value={form.name}
              onChange={(e) => field("name")(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-sku" className="field-label">SKU Code</label>
              <input
                id="item-sku"
                required
                type="text"
                placeholder="MILK-001"
                className="input"
                value={form.sku}
                onChange={(e) => field("sku")(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="item-category" className="field-label">Category</label>
              <input
                id="item-category"
                required
                type="text"
                placeholder="e.g. Dairy"
                className="input"
                value={form.category}
                onChange={(e) => field("category")(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="item-unit" className="field-label">Unit of Measure</label>
              <input
                id="item-unit"
                required
                type="text"
                placeholder="kg / L / pcs"
                className="input"
                value={form.unit}
                onChange={(e) => field("unit")(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="item-reorder" className="field-label">Reorder Level</label>
              <input
                id="item-reorder"
                required
                type="number"
                min="0"
                step="0.001"
                className="input"
                value={form.reorderThreshold}
                onChange={(e) => field("reorderThreshold")(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="item-cost" className="field-label">Unit Cost (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-zinc-400">₹</span>
              <input
                id="item-cost"
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="input pl-7"
                value={costText}
                onChange={(e) => setCostText(e.target.value)}
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Enter cost in rupees — stored as paise internally.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Saving…" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
