"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryNavTabs from "@/components/Inventory/InventoryNavTabs";
import { useBranch } from "@/lib/BranchContext";
import { useGetItemsQuery, useAdjustStockMutation } from "@/redux/slices/inventoryApiSlice";
import { Sliders, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function InventoryAdjustPage() {
  const { activeBranch, loading: branchLoading } = useBranch();
  const { data: itemsData, isLoading, refetch } = useGetItemsQuery(undefined, {
    skip: !activeBranch,
  });
  const [adjustStock, { isLoading: isSubmitting }] = useAdjustStockMutation();

  const [selectedItemId, setSelectedItemId] = useState("");
  const [changeAmount, setChangeAmount] = useState<number | "">("");
  const [direction, setDirection] = useState<"ADD" | "DEDUCT">("DEDUCT");
  const [reason, setReason] = useState<"SALE" | "WASTE" | "PURCHASE" | "ADJUSTMENT">("WASTE");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const items = itemsData?.items || [];
  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!selectedItemId) {
      setErrorMsg("Please select an inventory item.");
      return;
    }
    const numChange = Number(changeAmount);
    if (!Number.isFinite(numChange) || numChange <= 0) {
      setErrorMsg("Please enter a valid numeric quantity greater than 0.");
      return;
    }

    const finalChange = direction === "DEDUCT" ? -numChange : numChange;


    try {
      await adjustStock({
        itemId: selectedItemId,
        change: finalChange,
        reason,
      }).unwrap();

      setSuccessMsg(`Successfully adjusted stock for "${selectedItem?.name}" by ${finalChange > 0 ? "+" : ""}${finalChange} ${selectedItem?.unit || ""}.`);
      setChangeAmount("");
      refetch();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to adjust stock.");
    }
  };

  if (branchLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 gap-3 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin text-[#D3232A]" />
          <p className="text-sm font-medium">Loading branches…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4 sm:gap-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <InventoryNavTabs />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">
              Manual Stock Adjustment — <span className="text-[#D3232A]">{activeBranch?.name || "Branch"}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Record inventory changes directly (Sale, Waste, Purchase, or Adjustment)
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Card */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-xs">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#D3232A]" /> Adjust Item Quantity
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Select Item</label>
                <select
                  id="adjust-item-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs sm:text-sm focus:border-[#D3232A] focus:outline-none"
                  disabled={isLoading}
                >
                  <option value="">-- Choose an ingredient/item --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.sku}) — Current Stock: {i.currentStock} {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs flex flex-col sm:flex-row justify-between gap-1 sm:items-center text-zinc-700">
                  <span>Current Stock: <strong>{selectedItem.currentStock} {selectedItem.unit}</strong></span>
                  <span>Reorder Level: <strong>{selectedItem.reorderThreshold} {selectedItem.unit}</strong></span>
                  <span>Unit Cost: <strong>₹{(selectedItem.unitCostPaise / 100).toFixed(2)}</strong></span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Adjustment Type</label>
                  <select
                    id="adjust-direction-select"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as "ADD" | "DEDUCT")}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  >
                    <option value="DEDUCT">Deduct Stock (-)</option>
                    <option value="ADD">Add Stock (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason</label>
                  <select
                    id="adjust-reason-select"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  >
                    <option value="WASTE">Waste / Spoilage</option>
                    <option value="SALE">Sale / Usage</option>
                    <option value="PURCHASE">Purchase / Arrival</option>
                    <option value="ADJUSTMENT">Manual Reconciliation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Quantity ({selectedItem?.unit || "units"})</label>
                <input
                  id="adjust-quantity-input"
                  type="number"
                  step="any"
                  placeholder="Enter quantity amount..."
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                />
              </div>

              <button
                id="submit-adjust-btn"
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg bg-[#D3232A] py-2.5 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Adjustment"}
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-bold text-zinc-900">Adjustment Guidelines</h3>
            <ul className="text-xs text-zinc-600 space-y-2 list-disc pl-4 leading-relaxed">
              <li><strong>Sale:</strong> Auto or manual deductions when items are sold.</li>
              <li><strong>Waste:</strong> Spoilage, damaged goods, or prep loss.</li>
              <li><strong>Purchase:</strong> Incoming shipments received outside standard PO flow.</li>
              <li><strong>Reconciliation:</strong> Periodic count corrections to align actual stock with ledger.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
