"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  IndianRupee,
  Loader2,
  Sparkles,
} from "lucide-react";
import { InventoryItemApi } from "@/redux/slices/inventoryApiSlice";
import {
  useGetSuppliersQuery,
  useCreatePurchaseOrderMutation,
  SupplierApi,
} from "@/redux/slices/procurementApiSlice";

interface SmartPOItemLine {
  item: InventoryItemApi;
  suggestedQty: number;
  unitCostPaise: number;
  selectedSupplierId: string;
}

interface Props {
  outletId: string;
  lowStockItems: InventoryItemApi[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function SmartPOModal({
  outletId,
  lowStockItems,
  onClose,
  onSuccess,
}: Props) {
  const { data: suppliers = [], isLoading: isLoadingSuppliers } =
    useGetSuppliersQuery(undefined, { skip: !outletId });

  const [createPO, { isLoading: isSubmitting }] =
    useCreatePurchaseOrderMutation();

  const [masterSupplierId, setMasterSupplierId] = useState<string>("");
  const [lines, setLines] = useState<SmartPOItemLine[]>(() => {
    return lowStockItems.map((item) => {
      // Par-level calculation formula:
      // Suggested Qty = Math.max(reorderThreshold * 2 - currentStock, 5)
      const current = item.currentStock || 0;
      const reorder = item.reorderThreshold || 1;
      const suggested = Math.max(
        Math.ceil(reorder * 2 - current),
        Math.ceil(reorder * 1.5),
        5
      );

      return {
        item,
        suggestedQty: suggested,
        unitCostPaise: item.unitCostPaise,
        selectedSupplierId: "",
      };
    });
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Set default master supplier when suppliers load
  React.useEffect(() => {
    if (suppliers.length > 0 && !masterSupplierId) {
      setMasterSupplierId(suppliers[0].id);
      setLines((prev) =>
        prev.map((l) => ({
          ...l,
          selectedSupplierId: l.selectedSupplierId || suppliers[0].id,
        }))
      );
    }
  }, [suppliers, masterSupplierId]);

  const handleMasterSupplierChange = (supId: string) => {
    setMasterSupplierId(supId);
    setLines((prev) => prev.map((l) => ({ ...l, selectedSupplierId: supId })));
  };

  const handleLineQtyChange = (itemId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.item.id === itemId ? { ...l, suggestedQty: Math.max(1, qty) } : l
      )
    );
  };

  const handleLineSupplierChange = (itemId: string, supId: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.item.id === itemId ? { ...l, selectedSupplierId: supId } : l
      )
    );
  };

  // Group lines by supplier ID to generate POs per supplier
  const groupedBySupplier = useMemo(() => {
    const map: Record<string, SmartPOItemLine[]> = {};
    lines.forEach((line) => {
      const supId = line.selectedSupplierId || masterSupplierId;
      if (!supId) return;
      if (!map[supId]) map[supId] = [];
      map[supId].push(line);
    });
    return map;
  }, [lines, masterSupplierId]);

  const totalEstimatedPaise = useMemo(() => {
    return lines.reduce(
      (sum, line) => sum + line.suggestedQty * line.unitCostPaise,
      0
    );
  }, [lines]);

  const handleGeneratePOs = async () => {
    setFeedback(null);
    const supplierIds = Object.keys(groupedBySupplier);

    const invalidLine = lines.find(
      (l) => !Number.isFinite(l.suggestedQty) || l.suggestedQty <= 0
    );
    if (invalidLine) {
      setFeedback({
        type: "error",
        message: `Invalid quantity for "${invalidLine.item.name}". Quantity must be a positive number (1 or greater).`,
      });
      return;
    }

    if (supplierIds.length === 0) {
      setFeedback({
        type: "error",
        message: "Please select a supplier to generate Purchase Orders.",
      });
      return;
    }


    try {
      // Generate PO for each supplier group
      for (const supId of supplierIds) {
        const poLines = groupedBySupplier[supId].map((l) => ({
          itemId: l.item.id,
          orderedQuantity: l.suggestedQty,
          unitCostPaise: l.unitCostPaise,
        }));

        await createPO({
          supplierId: supId,
          items: poLines,
        }).unwrap();
      }

      setFeedback({
        type: "success",
        message: `Successfully generated ${supplierIds.length} Purchase Order(s) for low stock items!`,
      });

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err?.data?.message || err?.message || "Failed to generate Purchase Orders.",
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-po-title"
      className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-red-50 via-amber-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-[#D3232A] p-2 text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 id="smart-po-title" className="text-base font-bold text-zinc-900 flex items-center gap-2">
              1-Click Smart PO Generator
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-[#D3232A] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                <Sparkles className="h-3 w-3" /> Auto Par-Level
              </span>
            </h2>
            <p className="text-xs text-zinc-500">
              Auto-calculated suggested reorder quantities for low stock items
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`rounded-xl border p-3.5 text-xs font-medium flex items-center gap-2 ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Primary Supplier Selection Strip */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-700">
            <Building2 className="h-4 w-4 text-[#D3232A]" />
            <span className="font-semibold">Assign Default Supplier:</span>
          </div>
          <select
            value={masterSupplierId}
            onChange={(e) => handleMasterSupplierChange(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium focus:border-[#D3232A] focus:outline-none w-full sm:w-64"
            disabled={isLoadingSuppliers || suppliers.length === 0}
          >
            {suppliers.length === 0 ? (
              <option value="">No Suppliers Available</option>
            ) : (
              suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.contactPerson})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Low Stock Items Par-Level Table */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-200 text-[10px]">
                <th className="px-4 py-2.5">Item Name</th>
                <th className="px-4 py-2.5 text-center">Current Stock</th>
                <th className="px-4 py-2.5 text-center">Reorder Threshold</th>
                <th className="px-4 py-2.5 text-center">Suggested PO Qty</th>
                <th className="px-4 py-2.5">Supplier</th>
                <th className="px-4 py-2.5 text-right">Est. Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const estCost = ((line.suggestedQty * line.unitCostPaise) / 100).toFixed(2);
                return (
                  <tr key={line.item.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {line.item.name}
                      <span className="block text-[10px] text-zinc-400 font-mono font-normal">
                        {line.item.sku}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-red-600">
                      {line.item.currentStock} {line.item.unit}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">
                      {line.item.reorderThreshold} {line.item.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={line.suggestedQty}
                        onChange={(e) =>
                          handleLineQtyChange(line.item.id, Number(e.target.value))
                        }
                        className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-center font-bold text-zinc-900 focus:border-[#D3232A] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={line.selectedSupplierId || masterSupplierId}
                        onChange={(e) =>
                          handleLineSupplierChange(line.item.id, e.target.value)
                        }
                        className="w-36 rounded-md border border-zinc-300 px-2 py-1 text-[11px] focus:outline-none bg-white"
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900 tabular-nums">
                      ₹{estCost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Cost Summary Bar */}
        <div className="rounded-xl bg-zinc-900 text-white p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              Total Estimated PO Value
            </span>
            <p className="text-xl font-extrabold flex items-center gap-1 text-emerald-400">
              <IndianRupee className="h-5 w-5" />
              {(totalEstimatedPaise / 100).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <span className="block font-bold text-white">
              {Object.keys(groupedBySupplier).length} Purchase Order(s)
            </span>
            <span>Auto-grouped by assigned supplier</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGeneratePOs}
            disabled={isSubmitting || lines.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D3232A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b01e23] transition-colors disabled:opacity-50 shadow-md"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4 fill-current" /> Generate & Send POs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
