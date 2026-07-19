"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { adjustInventoryStock, InventoryItem } from "@/lib/api";

type StockReason = "PURCHASE" | "WASTE" | "SALE" | "ADJUSTMENT";
type Mode = "add" | "remove";

const ADD_REASONS: { value: StockReason; label: string; desc: string }[] = [
  { value: "PURCHASE",   label: "Purchase",   desc: "Received from supplier" },
  { value: "ADJUSTMENT", label: "Correction", desc: "Manual stock correction" },
];
const REMOVE_REASONS: { value: StockReason; label: string; desc: string }[] = [
  { value: "WASTE",      label: "Waste",      desc: "Spoilage or damage" },
  { value: "SALE",       label: "Sale",       desc: "Manual sale deduction" },
  { value: "ADJUSTMENT", label: "Correction", desc: "Manual stock correction" },
];

interface Props {
  outletId: string;
  item: InventoryItem;
  onAdjusted: () => void;
  onDemoAdjust?: (itemId: string, change: number) => void;
  onClose: () => void;
}

export default function AdjustStockModal({ outletId, item, onAdjusted, onDemoAdjust, onClose }: Props) {
  const [mode,   setMode]   = useState<Mode>("add");
  const [qty,    setQty]    = useState<number>(1);
  const [reason, setReason] = useState<StockReason>("PURCHASE");
  const [error,  setError]  = useState<string | null>(null);
  const [busy,   setBusy]   = useState(false);

  const firstBtnRef = useRef<HTMLButtonElement>(null);

  // Focus first button on open; Escape closes
  useEffect(() => {
    firstBtnRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const reasons    = mode === "add" ? ADD_REASONS : REMOVE_REASONS;
  const change     = mode === "add" ? qty : -qty;
  const stockAfter = item.currentStock + change;
  const overRemoval = mode === "remove" && qty > item.currentStock;

  const switchMode = (m: Mode) => {
    setMode(m);
    setQty(1);
    setError(null);
    setReason(m === "add" ? "PURCHASE" : "WASTE");
  };

  const handleQtyChange = (val: number) => {
    const next = Math.max(0.001, val);
    setQty(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }
    if (overRemoval) {
      setError(`Only ${item.currentStock} ${item.unit} available. Cannot remove ${qty}.`);
      return;
    }

    setError(null);
    setBusy(true);
    try {
      // Demo mode: update local state without backend
      if (onDemoAdjust) {
        onDemoAdjust(item.id, change);
        return;
      }
      const idempotencyKey = `${item.id}-${Date.now()}`;
      const res = await adjustInventoryStock(outletId, item.id, change, reason, idempotencyKey);
      if (!res.ok) { setError(res.error ?? "Failed to adjust stock."); return; }
      onAdjusted();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-stock-title"
      className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <h2 id="adjust-stock-title" className="text-base font-bold text-zinc-900">
          Adjust Stock
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
        {/* Item banner */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-5">
          <p className="font-semibold text-zinc-900">{item.name}</p>
          <p className="text-xs text-zinc-500 font-mono">{item.sku} · {item.category}</p>
          <p className="mt-2 text-sm text-zinc-600">
            Current stock:{" "}
            <span className="text-xl font-bold text-zinc-900">{item.currentStock}</span>
            <span className="text-sm text-zinc-400 ml-1">{item.unit}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Add / Remove toggle */}
          <div>
            <label className="field-label mb-2">What are you doing?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                ref={firstBtnRef}
                type="button"
                onClick={() => switchMode("add")}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                  mode === "add"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Add Stock
              </button>
              <button
                type="button"
                onClick={() => switchMode("remove")}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                  mode === "remove"
                    ? "border-red-400 bg-red-50 text-red-600"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <TrendingDown className="h-4 w-4" /> Remove Stock
              </button>
            </div>
          </div>

          {/* Quantity stepper — supports decimals (kg, L, etc.) */}
          <div>
            <label htmlFor="stock-qty" className="field-label">
              How many {item.unit}?
            </label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => handleQtyChange(parseFloat((qty - 1).toFixed(3)))}
                aria-label="Decrease quantity"
                className="h-10 w-10 shrink-0 rounded-lg border border-zinc-300 bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40"
                disabled={qty <= 0.001}
              >
                <Minus className="h-4 w-4 text-zinc-600" />
              </button>
              <input
                id="stock-qty"
                type="number"
                min="0.001"
                step="0.001"
                value={qty}
                onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                className="input text-center text-lg font-bold h-10 flex-1"
              />
              <button
                type="button"
                onClick={() => handleQtyChange(parseFloat((qty + 1).toFixed(3)))}
                aria-label="Increase quantity"
                className="h-10 w-10 shrink-0 rounded-lg border border-zinc-300 bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-zinc-600" />
              </button>
            </div>

            {/* Hard constraint warning */}
            {overRemoval && (
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <p className="text-xs font-medium text-red-600">
                  Can&apos;t remove {qty} {item.unit} — only {item.currentStock} available.
                </p>
              </div>
            )}
          </div>

          {/* Reason chips */}
          <div>
            <label className="field-label mb-2">Reason</label>
            <div className="grid grid-cols-1 gap-2">
              {reasons.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`flex items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                    reason === r.value
                      ? "border-zinc-700 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      reason === r.value ? "border-white" : "border-zinc-400"
                    }`}
                  >
                    {reason === r.value && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{r.label}</p>
                    <p className={`text-xs mt-0.5 ${reason === r.value ? "text-zinc-300" : "text-zinc-400"}`}>
                      {r.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div
            className={`rounded-lg border-2 px-4 py-3 transition-colors ${
              overRemoval
                ? "border-red-200 bg-red-50"
                : mode === "add"
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              After this adjustment
            </p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">
              {overRemoval ? "—" : stockAfter}
              <span className="text-sm font-normal text-zinc-500 ml-1">{item.unit}</span>
            </p>
            {!overRemoval && (
              <p className={`text-xs font-medium mt-0.5 ${mode === "add" ? "text-emerald-600" : "text-amber-600"}`}>
                {mode === "add" ? `＋${qty}` : `−${qty}`} {item.unit} from {item.currentStock}{" "}
                {item.unit}
              </p>
            )}
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
            <button
              type="submit"
              disabled={busy || overRemoval || qty <= 0}
              className={`btn-primary ${mode === "remove" ? "bg-red-600 hover:bg-red-700" : ""}`}
            >
              {busy
                ? "Saving…"
                : mode === "add"
                ? `Add ${qty} ${item.unit}`
                : `Remove ${qty} ${item.unit}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
