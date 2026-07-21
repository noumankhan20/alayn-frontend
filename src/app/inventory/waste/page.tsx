"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryNavTabs from "@/components/Inventory/InventoryNavTabs";
import { useBranch } from "@/lib/BranchContext";
import {
  useGetWasteLogsQuery,
  useLogWasteMutation,
  useGetWasteSummaryQuery,
} from "@/redux/slices/wasteApiSlice";
import { useGetItemsQuery } from "@/redux/slices/inventoryApiSlice";
import {
  Trash2,
  AlertTriangle,
  IndianRupee,
  Loader2,
  CheckCircle2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";


export default function WasteManagementPage() {
  const { activeBranch, loading: branchLoading } = useBranch();

  // RTK Queries
  const { data: wasteLogsData, isLoading: isLoadingLogs, refetch: refetchLogs } = useGetWasteLogsQuery(undefined, { skip: !activeBranch });
  const { data: wasteSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useGetWasteSummaryQuery(undefined, { skip: !activeBranch });
  const { data: itemsData } = useGetItemsQuery(undefined, { skip: !activeBranch });

  const items = itemsData?.items || [];
  const logs = wasteLogsData?.data || [];

  // Form Mutation State
  const [logWaste, { isLoading: isSubmitting }] = useLogWasteMutation();

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState<"SPOILAGE" | "OVER_PREP" | "RETURN" | "ERROR">("SPOILAGE");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Sorting & Filtering State
  const [sortField, setSortField] = useState<"createdAt" | "costAtLoggingPaise" | "quantity">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterReason, setFilterReason] = useState<string>("ALL");

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const calculatedCostRupees = selectedItem && quantity ? (Number(quantity) * (selectedItem.unitCostPaise / 100)).toFixed(2) : "0.00";

  const handleLogWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedItemId) return setFeedback({ type: "error", msg: "Please select an ingredient item." });
    
    const numQty = Number(quantity);
    if (!Number.isFinite(numQty) || numQty <= 0) {
      return setFeedback({ type: "error", msg: "Please enter a valid numeric waste quantity greater than 0." });
    }

    if (selectedItem && numQty > selectedItem.currentStock) {
      return setFeedback({
        type: "error",
        msg: `Wasted quantity (${numQty} ${selectedItem.unit}) cannot exceed current stock balance (${selectedItem.currentStock} ${selectedItem.unit}).`,
      });
    }


    try {
      await logWaste({
        itemId: selectedItemId,
        quantity: Number(quantity),
        reason,
      }).unwrap();

      setFeedback({ type: "success", msg: "Wastage recorded successfully and stock balance updated!" });
      setQuantity("");
      setSelectedItemId("");
      refetchLogs();
      refetchSummary();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.data?.message || err?.message || "Failed to log wastage." });
    }
  };

  // Sort & Filtered Logs
  const processedLogs = useMemo(() => {
    let result = [...logs];
    if (filterReason !== "ALL") {
      result = result.filter((l) => l.reason === filterReason);
    }
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [logs, filterReason, sortField, sortOrder]);

  const toggleSort = (field: "createdAt" | "costAtLoggingPaise" | "quantity") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const currentMonthWasteRupees = wasteSummary
    ? (wasteSummary.currentMonthWastePaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "0.00";

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

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">
              Waste Management — <span className="text-[#D3232A]">{activeBranch?.name || "Branch"}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Register ingredient spoilage logs and monitor cumulative wastage costs
            </p>
          </div>
        </div>

        {/* Top Cumulative Summary Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {isLoadingSummary ? (
            <>
              <div className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:p-5 shadow-xs">
                <Skeleton height={14} width="50%" className="mb-2" />
                <Skeleton height={32} width="40%" className="mb-2" />
                <Skeleton height={12} width="60%" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                    <Skeleton height={10} width="60%" className="mb-1" />
                    <Skeleton height={18} width="40%" className="mb-1" />
                    <Skeleton height={10} width="50%" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-600">Current Month Cumulative Waste</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-red-950 mt-1 flex items-center gap-1">
                    <IndianRupee className="h-6 sm:h-7 w-6 sm:w-7 text-red-600" /> ₹{currentMonthWasteRupees}
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-red-700 mt-1">Calculated for this calendar month</p>
                </div>
                <div className="rounded-full bg-red-100 p-2.5 sm:p-3 text-red-600 shrink-0">
                  <Trash2 className="h-6 sm:h-7 w-6 sm:w-7" />
                </div>
              </div>

              {/* Breakdown Pills */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {["SPOILAGE", "OVER_PREP", "ERROR", "RETURN"].map((r) => {
                  const group = wasteSummary?.byReason?.find((b) => b.reason === r);
                  const val = group ? (group.totalCostPaise / 100).toFixed(0) : "0";
                  return (
                    <div key={r} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400">{r.replace("_", " ")}</span>
                      <p className="text-sm sm:text-base font-bold text-zinc-900 mt-0.5">₹{val}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-500">{group?.count || 0} occurrences</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>



        {/* Feedback Banners */}
        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
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
            <p className="font-medium">{feedback.msg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs h-fit">
            <h2 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#D3232A]" /> Register Waste Log
            </h2>

            <form onSubmit={handleLogWaste} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Wasted Ingredient / Item</label>
                <select
                  required
                  id="waste-item-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                >
                  <option value="">-- Choose ingredient --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit}) — In Stock: {i.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason for Wastage</label>
                <select
                  id="waste-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                >
                  <option value="SPOILAGE">Spoilage / Expiration</option>
                  <option value="OVER_PREP">Over Preparation</option>
                  <option value="ERROR">Kitchen Error / Spillage</option>
                  <option value="RETURN">Customer Return</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Wasted Quantity ({selectedItem?.unit || "units"})
                </label>
                <input
                  id="waste-quantity-input"
                  type="number"
                  step="any"
                  placeholder="Enter quantity wasted..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                />
              </div>

              {selectedItem && quantity && (
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs flex justify-between items-center text-zinc-700">
                  <span>Calculated Cost:</span>
                  <strong className="text-red-600 text-sm">₹{calculatedCostRupees}</strong>
                </div>
              )}

              <button
                id="submit-waste-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#D3232A] py-2.5 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Wastage"}
              </button>
            </form>
          </div>

          {/* Historical Logs Table Card */}
          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                Historical Waste Logs ({processedLogs.length})
              </h2>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="ALL">All Reasons</option>
                  <option value="SPOILAGE">Spoilage</option>
                  <option value="OVER_PREP">Over Prep</option>
                  <option value="ERROR">Error</option>
                  <option value="RETURN">Return</option>
                </select>
              </div>
            </div>

            {isLoadingLogs ? (
              <div className="p-4 space-y-3">
                <Skeleton height={20} width="30%" className="mb-4" />
                <Skeleton count={5} height={40} borderRadius={8} className="mb-2" />
              </div>
            ) : processedLogs.length === 0 ? (

              <div className="flex flex-col items-center justify-center h-56 text-zinc-400 gap-2">
                <Trash2 className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">No waste logs recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                      <th
                        className="px-4 py-3 cursor-pointer select-none hover:text-zinc-900"
                        onClick={() => toggleSort("createdAt")}
                      >
                        <div className="flex items-center gap-1">
                          Logged Date <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3">Ingredient Item</th>
                      <th
                        className="px-4 py-3 text-center cursor-pointer select-none hover:text-zinc-900"
                        onClick={() => toggleSort("quantity")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Quantity <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-right cursor-pointer select-none hover:text-zinc-900"
                        onClick={() => toggleSort("costAtLoggingPaise")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Cost (₹) <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedLogs.map((log) => {
                      const reasonColors: Record<string, string> = {
                        SPOILAGE: "bg-red-50 text-red-700 border-red-200",
                        OVER_PREP: "bg-amber-50 text-amber-700 border-amber-200",
                        ERROR: "bg-orange-50 text-orange-700 border-orange-200",
                        RETURN: "bg-blue-50 text-blue-700 border-blue-200",
                      };

                      return (
                        <tr key={log.id} className="border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors">
                          <td className="px-4 py-3 text-xs text-zinc-600">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-900 text-xs">
                            {log.item?.name || "Ingredient Item"}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-800 font-bold text-xs">
                            {log.quantity} {log.item?.unit || ""}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600 text-xs tabular-nums">
                            ₹{(log.costAtLoggingPaise / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                reasonColors[log.reason] || "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {log.reason.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
