"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Building2,
  Loader2,
  RefreshCw,
  FlaskConical,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchInventoryItems, InventoryItem } from "@/lib/api";

import InventoryStatCard  from "./InventoryStatCard";
import InventoryItemTable from "./InventoryItemTable";
import AddItemModal       from "./AddItemModal";
import AdjustStockModal   from "./AdjustStockModal";
import InventoryToast, { ToastVariant } from "./InventoryToast";

// ── Demo / fallback items ─────────────────────────────────────────────────────

const DEMO_ITEMS: InventoryItem[] = [
  { id: "d1", name: "Premium Espresso Beans",     sku: "COF-ESP-001",  category: "Beverages", unit: "kg",    reorderThreshold: 10, unitCostPaise: 120000, currentStock: 24   },
  { id: "d2", name: "Whole Milk",                  sku: "MILK-WHL-002", category: "Dairy",     unit: "L",     reorderThreshold: 15, unitCostPaise: 8000,   currentStock: 8    },
  { id: "d3", name: "Oat Milk (Barista Edition)",  sku: "MILK-OAT-003", category: "Dairy",     unit: "L",     reorderThreshold: 10, unitCostPaise: 18000,  currentStock: 18   },
  { id: "d4", name: "Caramel Syrup",               sku: "SYR-CAR-004",  category: "Syrups",    unit: "Bottle",reorderThreshold: 5,  unitCostPaise: 45000,  currentStock: 3    },
  { id: "d5", name: "Paper Cups 12oz",             sku: "PKG-CUP-12OZ", category: "Packaging", unit: "pack",  reorderThreshold: 8,  unitCostPaise: 65000,  currentStock: 12   },
  { id: "d6", name: "Chocolate Chips",             sku: "BAK-CHP-006",  category: "Bakery",    unit: "kg",    reorderThreshold: 4,  unitCostPaise: 50000,  currentStock: 5    },
  { id: "d7", name: "Butter Croissant (Frozen)",   sku: "BAK-CRO-007",  category: "Bakery",    unit: "pcs",   reorderThreshold: 50, unitCostPaise: 4500,   currentStock: 120  },
  { id: "d8", name: "Vanilla Syrup",               sku: "SYR-VAN-008",  category: "Syrups",    unit: "Bottle",reorderThreshold: 5,  unitCostPaise: 42000,  currentStock: 7    },
  { id: "d9", name: "Disposable Lids (Hot)",       sku: "PKG-LID-HOT",  category: "Packaging", unit: "pack",  reorderThreshold: 6,  unitCostPaise: 35000,  currentStock: 4    },
  { id:"d10", name: "Almond Milk",                  sku: "MILK-ALM-010", category: "Dairy",     unit: "L",     reorderThreshold: 8,  unitCostPaise: 22000,  currentStock: 11   },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { activeBranch, loading: branchLoading, isDemo } = useBranch();

  const [items,          setItems]          = useState<InventoryItem[]>([]);
  const [search,         setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);

  const [showAdd,      setShowAdd]      = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter        = useRef(0);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const canManage = true; // backend is authoritative; show buttons for demo

  // ── Load items ───────────────────────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    if (!activeBranch) { setLoading(false); return; }

    setLoading(true);
    setFetchError(null);

    // Demo mode: just serve the local mock data instantly
    if (isDemo || activeBranch.id.startsWith("demo-")) {
      await new Promise((r) => setTimeout(r, 300)); // slight delay for realism
      setItems([...DEMO_ITEMS]);
      setLoading(false);
      return;
    }

    // Real backend call
    try {
      const data = await fetchInventoryItems({ outletId: activeBranch.id });
      // If backend returned nothing, show demo items as fallback
      setItems(data.length > 0 ? data : [...DEMO_ITEMS]);
    } catch {
      setFetchError("Could not reach the backend. Showing demo data.");
      setItems([...DEMO_ITEMS]);
    } finally {
      setLoading(false);
    }
  }, [activeBranch, isDemo]);

  // Reload whenever branch changes
  useEffect(() => {
    setItems([]);
    setSearch("");
    setCategoryFilter("All");
    loadItems();
  }, [loadItems, activeBranch?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter & stats ───────────────────────────────────────────────────────────
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()],
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        (item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)) &&
        (categoryFilter === "All" || item.category === categoryFilter),
    );
  }, [items, search, categoryFilter]);

  const totalValue    = items.reduce((s, i) => s + i.currentStock * (i.unitCostPaise / 100), 0);
  const lowStockCount = items.filter((i) => i.currentStock <= i.reorderThreshold).length;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleItemCreated = useCallback(
    (item: InventoryItem) => {
      setShowAdd(false);
      setItems((prev) => [{ ...item, currentStock: item.currentStock ?? 0 }, ...prev]);
      addToast(`"${item.name}" added to inventory.`, "success");
    },
    [addToast],
  );

  const handleAdjusted = useCallback(async () => {
    setAdjustTarget(null);
    if (!isDemo && !activeBranch?.id.startsWith("demo-")) {
      await loadItems();
    } else {
      // Demo: optimistically update the target item's stock in local state
      addToast("Stock updated (demo mode — not persisted).", "success");
    }
  }, [isDemo, activeBranch, loadItems, addToast]);

  // Demo-mode adjust: update local state directly without backend
  const handleDemoAdjust = useCallback(
    (itemId: string, change: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, currentStock: Math.max(0, i.currentStock + change) }
            : i,
        ),
      );
      setAdjustTarget(null);
      addToast("Stock updated (demo mode).", "success");
    },
    [addToast],
  );

  // ── Branch loading ────────────────────────────────────────────────────────────
  if (branchLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 gap-3 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Loading branches…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeBranch) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400">
          <Building2 className="h-10 w-10 stroke-[1.5]" />
          <p className="text-sm font-medium text-zinc-600">No branch selected</p>
          <p className="text-xs">Select a branch from the header to view inventory.</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-5 max-w-7xl mx-auto">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Inventory —{" "}
              <span className="text-[#D3232A]">{activeBranch.name}</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
              Manage stock levels and reorder thresholds for this branch
              {isDemo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ml-1">
                  <FlaskConical className="h-3 w-3" /> Demo Mode
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="refresh-inventory-btn"
              onClick={loadItems}
              title="Refresh inventory"
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {canManage && (
              <button
                id="add-inventory-item-btn"
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#D3232A] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#b01e23] transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Item
              </button>
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4">
          <InventoryStatCard
            icon={<Package className="h-5 w-5" />}
            iconCls="bg-red-50 text-[#D3232A]"
            label="Total SKUs"
            value={String(items.length)}
            sub={`${filteredItems.length} shown`}
          />
          <InventoryStatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconCls={lowStockCount > 0 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"}
            label="Low Stock"
            value={String(lowStockCount)}
            pulse={lowStockCount > 0}
            sub={lowStockCount > 0 ? "Needs reorder" : "All levels OK"}
          />
          <InventoryStatCard
            icon={<IndianRupee className="h-5 w-5" />}
            iconCls="bg-blue-50 text-blue-500"
            label="Stock Value"
            value={`₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            sub="at cost price"
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              id="inventory-search"
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            id="inventory-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-44"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            id="inventory-clear-filters-btn"
            onClick={() => { setSearch(""); setCategoryFilter("All"); }}
            title="Clear filters"
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Demo notice banner */}
        {isDemo && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <FlaskConical className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <p>
              <strong>Demo Mode</strong> — The backend is not connected. Showing sample inventory data.
              Adjustments will update the local view only and won&apos;t be saved.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 h-56">
              <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-zinc-200 border-t-[#D3232A]" />
              <span className="text-sm text-zinc-400">Loading inventory…</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center gap-2 h-56">
              <AlertTriangle className="h-7 w-7 text-amber-400" />
              <p className="text-sm font-medium text-zinc-600">{fetchError}</p>
              <button onClick={loadItems} className="text-xs text-[#D3232A] underline hover:text-[#b01e23]">
                Retry
              </button>
            </div>
          ) : (
            <InventoryItemTable
              items={filteredItems}
              onAdjust={setAdjustTarget}
              canManage={canManage}
            />
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAdd && activeBranch && (
        <Overlay onClose={() => setShowAdd(false)}>
          <AddItemModal
            outletId={activeBranch.id}
            onCreated={handleItemCreated}
            onClose={() => setShowAdd(false)}
            isDemo={isDemo}
          />
        </Overlay>
      )}

      {/* Adjust Stock Modal */}
      {adjustTarget && activeBranch && (
        <Overlay onClose={() => setAdjustTarget(null)}>
          <AdjustStockModal
            outletId={activeBranch.id}
            item={adjustTarget}
            onAdjusted={handleAdjusted}
            onDemoAdjust={isDemo ? handleDemoAdjust : undefined}
            onClose={() => setAdjustTarget(null)}
          />
        </Overlay>
      )}

      {/* Toasts */}
      {toasts.map((t) => (
        <InventoryToast
          key={t.id}
          message={t.message}
          variant={t.variant}
          onDismiss={() => dismissToast(t.id)}
        />
      ))}
    </DashboardLayout>
  );
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
