"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryNavTabs from "@/components/Inventory/InventoryNavTabs";
import { useBranch } from "@/lib/BranchContext";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useReceivePOItemMutation,
  SupplierApi,
  PurchaseOrderApi,
} from "@/redux/slices/procurementApiSlice";
import { useGetItemsQuery } from "@/redux/slices/inventoryApiSlice";
import {
  Truck,
  Plus,
  Building2,
  PackageCheck,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Zap,
  Trash2,
  Search,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import SmartPOModal from "@/components/Inventory/SmartPOModal";



export default function ProcurementPage() {
  const { activeBranch, loading: branchLoading } = useBranch();
  const [activeTab, setActiveTab] = useState<"POS" | "SUPPLIERS">("POS");

  // RTK Queries
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useGetSuppliersQuery(undefined, { skip: !activeBranch });
  const { data: purchaseOrders = [], isLoading: isLoadingPOs, refetch: refetchPOs } = useGetPurchaseOrdersQuery(undefined, { skip: !activeBranch });
  const { data: inventoryData } = useGetItemsQuery(undefined, { skip: !activeBranch });
  const items = inventoryData?.items || [];

  // Mutations
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeletingSupplier }] = useDeleteSupplierMutation();
  const [receivePOItem, { isLoading: isReceiving }] = useReceivePOItemMutation();

  // Modals state
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showSmartPOModal, setShowSmartPOModal] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrderApi | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierApi | null>(null);

  // Supplier Search & Category Filter states
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [selectedSupplierCategoryFilter, setSelectedSupplierCategoryFilter] = useState("ALL");

  const lowStockItems = React.useMemo(() => {
    return items.filter((i) => (i.currentStock || 0) <= i.reorderThreshold);
  }, [items]);

  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter((s) => {
      const q = supplierSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchesCategory =
        selectedSupplierCategoryFilter === "ALL" ||
        (s.category && s.category.toLowerCase().trim() === selectedSupplierCategoryFilter.toLowerCase().trim());

      return matchesSearch && matchesCategory;
    });
  }, [suppliers, supplierSearchQuery, selectedSupplierCategoryFilter]);

  // Form states
  const [supplierForm, setSupplierForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "", category: "Dairy" });

  // Receiving Form state
  const [receiveItemInputs, setReceiveItemInputs] = useState<{ [itemId: string]: { receivedQuantity: number; batchNumber: string; expiryDate: string } }>({});

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(supplierForm).unwrap();
      setShowAddSupplierModal(false);
      setSupplierForm({ name: "", contactPerson: "", phone: "", email: "", address: "", category: "Dairy" });
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create supplier");
    }
  };

  const handleDeleteSupplierConfirm = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteSupplier(deletingSupplier.id).unwrap();
      setDeletingSupplier(null);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete supplier");
    }
  };

  const handleOpenReceive = (po: PurchaseOrderApi) => {
    setReceivingPO(po);
    const initialInputs: { [itemId: string]: { receivedQuantity: number; batchNumber: string; expiryDate: string } } = {};
    po.items.forEach((item) => {
      const remaining = Math.max(0, (item.orderedQuantity || 0) - (item.receivedQuantity || 0));
      initialInputs[item.itemId] = {
        receivedQuantity: remaining,
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
    });
    setReceiveItemInputs(initialInputs);
  };

  const handleConfirmReceive = async () => {
    if (!receivingPO) return;

    for (const [itemId, input] of Object.entries(receiveItemInputs)) {
      const qty = Number(input.receivedQuantity);
      if (qty > 0) {
        if (!Number.isFinite(qty)) {
          return alert("Received quantity must be a valid number.");
        }
        if (!input.batchNumber.trim()) {
          return alert("Batch number is required for receiving stock.");
        }
      }
    }

    const itemsPayload = Object.entries(receiveItemInputs)
      .filter(([_, input]) => Number(input.receivedQuantity) > 0)
      .map(([itemId, input]) => ({
        itemId,
        receivedQuantity: Number(input.receivedQuantity),
        batchNumber: input.batchNumber.trim(),
        expiryDate: input.expiryDate,
      }));

    if (itemsPayload.length === 0) return alert("Enter quantity greater than 0 for at least one item to receive.");


    try {
      await receivePOItem({ id: receivingPO.id, items: itemsPayload }).unwrap();
      setReceivingPO(null);
      refetchPOs();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to receive PO items");
    }
  };



  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4 sm:gap-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <InventoryNavTabs />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900">
              Stock Orders & Suppliers — <span className="text-[#D3232A]">{activeBranch?.name || "Branch"}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Order stock from suppliers, track incoming stock, and manage vendor details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="add-supplier-btn"
              onClick={() => setShowAddSupplierModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Supplier
            </button>
            <button
              id="smart-po-procurement-btn"
              onClick={() => setShowSmartPOModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-[#D3232A] to-red-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95 transition-opacity shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 fill-current" /> Quick Restock Order {lowStockItems.length > 0 ? `(${lowStockItems.length} Low)` : ''}
            </button>
          </div>

        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-zinc-200 gap-4 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab("POS")}
            className={`pb-2 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "POS" ? "border-[#D3232A] text-[#D3232A]" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Stock Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("SUPPLIERS")}
            className={`pb-2 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "SUPPLIERS" ? "border-[#D3232A] text-[#D3232A]" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
        </div>

        {/* TAB 1: PURCHASE ORDERS */}
        {activeTab === "POS" && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-x-auto">
            {(isLoadingPOs || branchLoading) ? (

              <div className="p-4 space-y-3">
                <Skeleton height={24} width="25%" className="mb-4" />
                <Skeleton count={5} height={42} borderRadius={8} className="mb-2" />
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-2">
                <Truck className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">No Stock Orders placed yet</p>
                <button
                  onClick={() => setShowSmartPOModal(true)}
                  className="text-xs text-[#D3232A] font-semibold underline hover:text-[#b01e23] flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" /> Create Restock Order
                </button>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                    <th className="px-5 py-3">PO Reference</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3 text-center">Items Count</th>
                    <th className="px-5 py-3 text-right">Total Amount</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => {
                    const statusColors: Record<string, string> = {
                      DRAFT: "bg-zinc-100 text-zinc-700 border-zinc-300",
                      SENT: "bg-blue-50 text-blue-700 border-blue-200",
                      PARTIALLY_RECEIVED: "bg-amber-50 text-amber-700 border-amber-200",
                      RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      CLOSED: "bg-zinc-100 text-zinc-500 border-zinc-200",
                    };
                    const isReceivable = po.status !== "RECEIVED" && po.status !== "CLOSED";

                    return (
                      <tr key={po.id} className="border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-3 font-mono font-semibold text-zinc-800 text-xs">
                          #{po.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3 font-medium text-zinc-900">
                          {po.actualSupplier?.name || "Supplier"}
                        </td>
                        <td className="px-5 py-3 text-center text-zinc-600">{po.items?.length || 0}</td>
                        <td className="px-5 py-3 text-right font-semibold text-zinc-900 tabular-nums">
                          ₹{(po.totalAmountPaise / 100).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                              statusColors[po.status] || "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {po.status === "RECEIVED" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : po.status === "PARTIALLY_RECEIVED" ? (
                              <Clock className="h-3 w-3" />
                            ) : null}
                            {po.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {isReceivable ? (
                            <button
                              onClick={() => handleOpenReceive(po)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              <PackageCheck className="h-3.5 w-3.5" /> Receive Items
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-400 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: SUPPLIERS */}
        {activeTab === "SUPPLIERS" && (
          <div className="space-y-4">
            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
              {/* Search Box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search suppliers by name, contact, phone..."
                  value={supplierSearchQuery}
                  onChange={(e) => setSupplierSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 pl-9 pr-3 py-1.5 text-xs text-zinc-800 focus:border-[#D3232A] focus:outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  "ALL",
                  "Dairy",
                  "Frozen Goods",
                  "Meat & Poultry",
                  "Produce",
                  "Beverages",
                  "Bakery",
                  "Syrups & Sauces",
                  "Packaging",
                  "General",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSupplierCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-all whitespace-nowrap ${
                      selectedSupplierCategoryFilter.toLowerCase() === cat.toLowerCase()
                        ? "bg-[#D3232A] text-white shadow-2xs"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isLoadingSuppliers || branchLoading) ? (

                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                    <Skeleton height={20} width="60%" className="mb-2" />
                    <Skeleton height={14} width="40%" className="mb-3" />
                    <Skeleton count={3} height={12} className="mb-1" />
                  </div>
                ))
              ) : filteredSuppliers.length === 0 ? (

                <div className="col-span-full flex flex-col items-center justify-center h-48 text-zinc-400 gap-2 bg-white rounded-xl border border-zinc-200 p-6">
                  <Building2 className="h-8 w-8 text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-600">
                    {suppliers.length === 0
                      ? "No suppliers registered yet"
                      : "No suppliers match your search filter"}
                  </p>
                  {suppliers.length === 0 ? (
                    <button
                      onClick={() => setShowAddSupplierModal(true)}
                      className="text-xs text-[#D3232A] font-semibold underline hover:text-[#b01e23]"
                    >
                      Add your first supplier contact
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSupplierSearchQuery("");
                        setSelectedSupplierCategoryFilter("ALL");
                      }}
                      className="text-xs text-[#D3232A] font-semibold underline"
                    >
                      Clear search filters
                    </button>
                  )}
                </div>
              ) : (
                filteredSuppliers.map((s) => (
                  <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#D3232A]" /> {s.name}
                          </h3>
                          <p className="text-xs font-medium text-zinc-500 mt-0.5">Contact: {s.contactPerson}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center rounded-full bg-red-50 text-[#D3232A] border border-red-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                            {s.category || "General"}
                          </span>
                          <button
                            onClick={() => setDeletingSupplier(s)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                            title="Delete Supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-zinc-600 border-t border-zinc-100 pt-2.5">
                        <p><strong>Phone:</strong> {s.phone}</p>
                        <p><strong>Email:</strong> {s.email}</p>
                        <p className="truncate"><strong>Address:</strong> {s.address}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL 1: ADD SUPPLIER */}
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Add New Supplier</h2>

              <form onSubmit={handleCreateSupplier} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Fresh Dairy Suppliers Ltd"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Supplier Product Category</label>
                  <select
                    required
                    value={supplierForm.category}
                    onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none font-medium bg-white"
                  >
                    <option value="Dairy">Dairy (Milk, Cheese, Butter, etc.)</option>
                    <option value="Frozen Goods">Frozen Goods (Frozen Chicken, Ice Cream, etc.)</option>
                    <option value="Meat & Poultry">Meat & Poultry (Chicken, Mutton, Fish)</option>
                    <option value="Produce">Produce / Vegetables & Fruits</option>
                    <option value="Beverages">Beverages & Soft Drinks</option>
                    <option value="Bakery">Bakery & Bread</option>
                    <option value="Syrups & Sauces">Syrups, Sauces & Spices</option>
                    <option value="Packaging">Packaging & Containers</option>
                    <option value="General">General / All Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Contact Person</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone</label>
                    <input
                      required
                      type="text"
                      placeholder="+91 9876543210"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="supplier@example.com"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Supplier street address..."
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingSupplier}
                  className="w-full rounded-lg bg-[#D3232A] py-2.5 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors mt-2"
                >
                  {isCreatingSupplier ? "Saving Supplier…" : "Save Supplier"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: RECEIVE PO ITEMS */}
        {receivingPO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setReceivingPO(null)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-zinc-900 mb-1">
                Receive Stock — PO #{receivingPO.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Record incoming stock batch details and expiry dates
              </p>

              <div className="space-y-4">
                {receivingPO.items.map((poItem) => {
                  const input = receiveItemInputs[poItem.itemId] || { receivedQuantity: 0, batchNumber: "", expiryDate: "" };
                  return (
                    <div key={poItem.id} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-zinc-900 text-sm">{poItem.item?.name || "Ingredient"}</span>
                        <span className="text-xs text-zinc-500">
                          Ordered: <strong>{poItem.orderedQuantity}</strong> | Prev Received: <strong>{poItem.receivedQuantity}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Receive Quantity</label>
                          <input
                            type="number"
                            step="any"
                            value={input.receivedQuantity}
                            onChange={(e) =>
                              setReceiveItemInputs({
                                ...receiveItemInputs,
                                [poItem.itemId]: { ...input, receivedQuantity: Number(e.target.value) },
                              })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Batch Number</label>
                          <input
                            type="text"
                            value={input.batchNumber}
                            onChange={(e) =>
                              setReceiveItemInputs({
                                ...receiveItemInputs,
                                [poItem.itemId]: { ...input, batchNumber: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={input.expiryDate}
                            onChange={(e) =>
                              setReceiveItemInputs({
                                ...receiveItemInputs,
                                [poItem.itemId]: { ...input, expiryDate: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={handleConfirmReceive}
                  disabled={isReceiving}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  {isReceiving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Stock Arrival"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: 1-CLICK SMART PO GENERATOR */}
        {showSmartPOModal && activeBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <SmartPOModal
              outletId={activeBranch.id}
              lowStockItems={lowStockItems}
              allItems={items}
              onClose={() => setShowSmartPOModal(false)}
              onSuccess={() => {
                setShowSmartPOModal(false);
                refetchPOs();
              }}
            />
          </div>
        )}

        {/* MODAL 5: DELETE SUPPLIER CONFIRMATION */}
        {deletingSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-zinc-200">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 text-red-600 mb-3">
                <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Delete Supplier</h2>
                  <p className="text-xs text-zinc-500">Confirm permanent vendor removal</p>
                </div>
              </div>

              <div className="space-y-3 py-2">
                <p className="text-sm text-zinc-700">
                  Are you sure you want to delete supplier <strong>"{deletingSupplier.name}"</strong>?
                </p>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
                  <strong>Notice:</strong> Removing this supplier will remove their contact profile from active vendors. Existing purchase orders and historical stock logs will be preserved.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setDeletingSupplier(null)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSupplierConfirm}
                  disabled={isDeletingSupplier}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isDeletingSupplier ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" /> Delete Supplier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


