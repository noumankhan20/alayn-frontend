"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryNavTabs from "@/components/Inventory/InventoryNavTabs";
import { useBranch } from "@/lib/BranchContext";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
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
  const [createPO, { isLoading: isCreatingPO }] = useCreatePurchaseOrderMutation();
  const [receivePOItem, { isLoading: isReceiving }] = useReceivePOItemMutation();

  // Modals state
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showSmartPOModal, setShowSmartPOModal] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrderApi | null>(null);

  const lowStockItems = React.useMemo(() => {
    return items.filter((i) => (i.currentStock || 0) <= i.reorderThreshold);
  }, [items]);


  // Form states
  const [supplierForm, setSupplierForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "" });
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poLineItems, setPoLineItems] = useState<{ itemId: string; orderedQuantity: number; unitCostPaise: number }[]>([
    { itemId: "", orderedQuantity: 1, unitCostPaise: 0 },
  ]);

  // Receiving Form state
  const [receiveItemInputs, setReceiveItemInputs] = useState<{ [itemId: string]: { receivedQuantity: number; batchNumber: string; expiryDate: string } }>({});

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(supplierForm).unwrap();
      setShowAddSupplierModal(false);
      setSupplierForm({ name: "", contactPerson: "", phone: "", email: "", address: "" });
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create supplier");
    }
  };

  const handleAddPOLine = () => {
    setPoLineItems((prev) => [...prev, { itemId: "", orderedQuantity: 1, unitCostPaise: 0 }]);
  };

  const handlePOLineChange = (index: number, field: string, val: any) => {
    setPoLineItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: val };
        if (field === "itemId") {
          const invItem = items.find((i) => i.id === val);
          if (invItem) updated.unitCostPaise = invItem.unitCostPaise;
        }
        return updated;
      })
    );
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) return alert("Please select a supplier.");

    for (const line of poLineItems) {
      if (!line.itemId) return alert("Please select an item for all line items.");
      const qty = Number(line.orderedQuantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return alert("Ordered quantity for each item must be a valid positive number.");
      }
      const cost = Number(line.unitCostPaise);
      if (!Number.isFinite(cost) || cost <= 0) {
        return alert("Unit cost for each item must be greater than ₹0.00.");
      }
    }

    const validLines = poLineItems.map((line) => ({
      itemId: line.itemId,
      orderedQuantity: Number(line.orderedQuantity),
      unitCostPaise: Math.round(Number(line.unitCostPaise)),
    }));

    try {
      await createPO({ supplierId: poSupplierId, items: validLines }).unwrap();
      setShowCreatePOModal(false);
      setPoSupplierId("");
      setPoLineItems([{ itemId: "", orderedQuantity: 1, unitCostPaise: 0 }]);
      refetchPOs();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create purchase order");
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
              Procurement & Purchase Orders — <span className="text-[#D3232A]">{activeBranch?.name || "Branch"}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage suppliers, purchase orders, and receive incoming inventory batches
            </p>
          </div>

          <div className="flex items-center gap-2">
            {lowStockItems.length > 0 && (
              <button
                id="smart-po-procurement-btn"
                onClick={() => setShowSmartPOModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#D3232A] px-3.5 py-2 text-xs font-bold text-white hover:opacity-95 transition-opacity shadow-xs"
              >
                <Zap className="h-3.5 w-3.5 fill-current" /> 1-Click Smart PO ({lowStockItems.length})
              </button>
            )}
            <button
              id="add-supplier-btn"
              onClick={() => setShowAddSupplierModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Supplier
            </button>
            <button
              id="create-po-btn"
              onClick={() => setShowCreatePOModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D3232A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#b01e23] transition-colors shadow-xs"
            >
              <Truck className="h-3.5 w-3.5" /> Create PO
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
            Purchase Orders ({purchaseOrders.length})
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
            {isLoadingPOs ? (
              <div className="p-4 space-y-3">
                <Skeleton height={24} width="25%" className="mb-4" />
                <Skeleton count={5} height={42} borderRadius={8} className="mb-2" />
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-2">
                <Truck className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">No Purchase Orders yet</p>
                <button
                  onClick={() => setShowCreatePOModal(true)}
                  className="text-xs text-[#D3232A] font-semibold underline hover:text-[#b01e23]"
                >
                  Create your first PO
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingSuppliers ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <Skeleton height={20} width="60%" className="mb-2" />
                  <Skeleton height={14} width="40%" className="mb-3" />
                  <Skeleton count={3} height={12} className="mb-1" />
                </div>
              ))
            ) : suppliers.length === 0 ? (

              <div className="col-span-full flex flex-col items-center justify-center h-48 text-zinc-400 gap-2">
                <Building2 className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">No suppliers registered</p>
                <button
                  onClick={() => setShowAddSupplierModal(true)}
                  className="text-xs text-[#D3232A] font-semibold underline hover:text-[#b01e23]"
                >
                  Add your first supplier contact
                </button>
              </div>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#D3232A]" /> {s.name}
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 mt-1">Contact: {s.contactPerson}</p>
                    <div className="mt-3 space-y-1 text-xs text-zinc-600">
                      <p><strong>Phone:</strong> {s.phone}</p>
                      <p><strong>Email:</strong> {s.email}</p>
                      <p className="truncate"><strong>Address:</strong> {s.address}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
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

        {/* MODAL 2: CREATE PURCHASE ORDER */}
        {showCreatePOModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreatePOModal(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Create Purchase Order</h2>

              <form onSubmit={handleCreatePO} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Select Supplier</label>
                  <select
                    required
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#D3232A] focus:outline-none"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-zinc-700">Order Items</label>
                    <button
                      type="button"
                      onClick={handleAddPOLine}
                      className="text-xs text-[#D3232A] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Item Line
                    </button>
                  </div>

                  <div className="space-y-2">
                    {poLineItems.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          className="col-span-6 rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:outline-none"
                          value={line.itemId}
                          onChange={(e) => handlePOLineChange(idx, "itemId", e.target.value)}
                        >
                          <option value="">-- Select Item --</option>
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          className="col-span-3 rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:outline-none"
                          value={line.orderedQuantity}
                          onChange={(e) => handlePOLineChange(idx, "orderedQuantity", Number(e.target.value))}
                        />
                        <input
                          type="number"
                          placeholder="Unit Cost (₹)"
                          className="col-span-3 rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:outline-none"
                          value={line.unitCostPaise ? line.unitCostPaise / 100 : ""}
                          onChange={(e) => handlePOLineChange(idx, "unitCostPaise", Math.round(Number(e.target.value) * 100))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingPO}
                  className="w-full rounded-lg bg-[#D3232A] py-2.5 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors mt-4"
                >
                  {isCreatingPO ? "Generating PO…" : "Submit Purchase Order"}
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
              onClose={() => setShowSmartPOModal(false)}
              onSuccess={() => {
                setShowSmartPOModal(false);
                refetchPOs();
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


