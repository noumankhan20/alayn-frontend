import React, { useState, useEffect, useMemo, useCallback } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  QrCode,
  Plus,
  Printer,
  Trash2,
  Wind,
  Sun,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  LayoutGrid,
  Layers,
  Users,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import { useBranch } from "@/lib/BranchContext";
import {
  fetchTables,
  createBulkTables,
  updateTable,
  deleteTable,
  TableItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type FilterType = "ALL" | "AC" | "NON_AC" | "AVAILABLE" | "OCCUPIED";

export default function TableManagementComponent() {
  const { activeBranch } = useBranch();
  // Exclude the "all" pseudo-ID used for multi-outlet overview — tables are outlet-scoped
  const currentOutletId = activeBranch?.id && activeBranch.id !== "all" ? activeBranch.id : null;

  // Data state
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");

  // Add tables modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [acCount, setAcCount] = useState<string | number>(5);
  const [nonAcCount, setNonAcCount] = useState<string | number>(5);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Print modals
  const [printTable, setPrintTable] = useState<TableItem | null>(null);
  const [showBulkPrint, setShowBulkPrint] = useState(false);

  // Per-table action loading
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadTables = useCallback(async () => {
    if (!currentOutletId) return;
    setLoading(true);
    setError(null);
    const res = await fetchTables(currentOutletId);
    if (res.ok && res.tables) {
      setTables(res.tables);
    } else {
      setError(res.error || "Failed to load tables. Please try again.");
    }
    setLoading(false);
  }, [currentOutletId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => ({
    total: tables.length,
    ac: tables.filter((t) => t.tableType === "AC").length,
    nonAc: tables.filter((t) => t.tableType === "NON_AC").length,
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
  }), [tables]);

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSearch = search === "" || String(t.tableNumber).includes(search.trim());
      if (!matchSearch) return false;
      if (filter === "AC") return t.tableType === "AC";
      if (filter === "NON_AC") return t.tableType === "NON_AC";
      if (filter === "AVAILABLE") return t.status === "AVAILABLE";
      if (filter === "OCCUPIED") return t.status === "OCCUPIED";
      return true;
    });
  }, [tables, search, filter]);

  // ── QR URL helper ─────────────────────────────────────────────────────────
  const getQRImageUrl = (token: string | null, size = 200) => {
    if (!token) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const targetUrl = `${origin}/order?token=${token}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encodeURIComponent(targetUrl)}`;
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleAddTables = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!currentOutletId) return;
    const numAc = typeof acCount === "number" ? acCount : parseInt(acCount) || 0;
    const numNonAc = typeof nonAcCount === "number" ? nonAcCount : parseInt(nonAcCount) || 0;
    if (numAc + numNonAc === 0) {
      setAddError("Enter at least 1 table to create.");
      return;
    }
    setSubmittingAdd(true);
    const res = await createBulkTables(currentOutletId, numAc, numNonAc);
    setSubmittingAdd(false);
    if (res.ok) {
      setShowAddModal(false);
      setAcCount(5);
      setNonAcCount(5);
      loadTables();
    } else {
      setAddError(res.error || "Failed to create tables.");
    }
  };

  const handleToggleStatus = async (table: TableItem) => {
    if (!currentOutletId) return;
    const newStatus = table.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";
    setPendingId(table.id);
    const res = await updateTable(currentOutletId, table.id, { status: newStatus });
    setPendingId(null);
    if (res.ok) {
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: newStatus } : t))
      );
    } else {
      setError(res.error || "Failed to update status.");
    }
  };

  const handleDeleteTable = async (table: TableItem) => {
    if (!currentOutletId) return;
    if (!window.confirm(`Delete Table ${table.tableNumber}? This cannot be undone.`)) return;
    setPendingId(table.id);
    const res = await deleteTable(currentOutletId, table.id);
    setPendingId(null);
    if (res.ok) {
      loadTables();
    } else {
      setError(res.error || "Failed to delete table.");
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const StatCard = ({
    label,
    value,
    icon: Icon,
    colorClass,
    bgClass,
  }: {
    label: string;
    value: number;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-extrabold mt-1 ${colorClass}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
  );

  const TableCard = ({ table }: { table: TableItem }) => {
    const isAc = table.tableType === "AC";
    const isOccupied = table.status === "OCCUPIED";
    const isPending = pendingId === table.id;

    return (
      <div
        className={cn(
          "bg-white rounded-xl border shadow-xs flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md p-4 gap-3",
          isOccupied ? "border-rose-200" : "border-gray-200"
        )}
      >
        {/* Header: Table Number & AC/Non-AC Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                isOccupied ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
              )}
            />
            <h3 className="text-base font-extrabold text-[#1B2A4A]">
              Table {table.tableNumber}
            </h3>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
              isAc
                ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {isAc ? <Wind className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            {isAc ? "AC" : "Non-AC"}
          </span>
        </div>

        {/* Status Toggle Button */}
        <button
          onClick={() => handleToggleStatus(table)}
          disabled={isPending}
          className={cn(
            "w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5",
            isOccupied
              ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
          )}
        >
          {isOccupied ? "Occupied · Set Available" : "Available · Set Occupied"}
        </button>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setPrintTable(table)}
            className="flex-1 btn-primary py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print QR
          </button>
          <button
            onClick={() => handleDeleteTable(table)}
            disabled={isPending}
            title="Delete table"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 text-[#1B2A4A]">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <QrCode className="w-6 h-6 text-[#D3232A]" />
              Table Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Configure AC &amp; Non-AC tables, view statuses, and print QR codes for customer self-ordering.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <button
              onClick={() => setShowBulkPrint(true)}
              disabled={tables.length === 0}
              className="btn-ghost flex justify-center items-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              Print All QRs
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex justify-center items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Tables
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1">
              {typeof error === "string"
                ? error
                : (error as any)?.message || (error as any)?.code || JSON.stringify(error)}
            </p>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Tables" value={metrics.total} icon={LayoutGrid} colorClass="text-[#1B2A4A]" bgClass="bg-blue-50" />
          <StatCard label="AC Tables" value={metrics.ac} icon={Wind} colorClass="text-cyan-600" bgClass="bg-cyan-50" />
          <StatCard label="Non-AC Tables" value={metrics.nonAc} icon={Sun} colorClass="text-amber-600" bgClass="bg-amber-50" />
          <StatCard label="Available" value={metrics.available} icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
          <StatCard label="Occupied" value={metrics.occupied} icon={Users} colorClass="text-rose-600" bgClass="bg-rose-50" />
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by table number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#D3232A] transition"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-medium flex-wrap">
              {(
                [
                  { label: "All", value: "ALL" },
                  { label: "AC", value: "AC" },
                  { label: "Non-AC", value: "NON_AC" },
                  { label: "Available", value: "AVAILABLE" },
                  { label: "Occupied", value: "OCCUPIED" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition whitespace-nowrap",
                    filter === item.value
                      ? "bg-[#D3232A] text-white font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table grid */}
        {loading ? (
          <SkeletonTheme baseColor="#E2E8F0" highlightColor="#F8FAFC">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <Skeleton width={90} height={20} borderRadius={6} />
                    <Skeleton width={60} height={20} borderRadius={12} />
                  </div>
                  <Skeleton height={32} borderRadius={8} />
                  <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
                    <Skeleton width={80} height={28} borderRadius={6} />
                    <Skeleton width={28} height={28} borderRadius={6} />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonTheme>
        ) : filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <QrCode className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-[#1B2A4A]">
              {tables.length === 0 ? "No Tables Yet" : "No Matching Tables"}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mt-1 mb-5">
              {tables.length === 0
                ? "Click 'Add Tables' above to set up your AC and Non-AC dining tables."
                : "Try adjusting your search or filter."}
            </p>
            {tables.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Tables
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Add Tables ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Layers className="w-4 h-4 text-[#D3232A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B2A4A]">Add Dining Tables</h3>
                  <p className="text-xs text-gray-400">QR codes are generated automatically</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setAddError(null); }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAddTables} className="px-6 py-5 space-y-4">
              {addError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {typeof addError === "string"
                      ? addError
                      : (addError as any)?.message || (addError as any)?.code || JSON.stringify(addError)}
                  </span>
                </div>
              )}

              <div>
                <label className="field-label">
                  <Wind className="inline w-3 h-3 mr-1 text-cyan-500" />
                  AC Tables
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={acCount}
                  onChange={(e) => setAcCount(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="field-label">
                  <Sun className="inline w-3 h-3 mr-1 text-amber-500" />
                  Non-AC Tables
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={nonAcCount}
                  onChange={(e) => setNonAcCount(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  className="input mt-1"
                />
              </div>

              {/* Summary */}
              {((Number(acCount) || 0) > 0 || (Number(nonAcCount) || 0) > 0) && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-[#1B2A4A] mb-1">What will be created:</p>
                  {(Number(acCount) || 0) > 0 && <p>· {acCount} AC table{Number(acCount) !== 1 ? "s" : ""} with unique QR codes</p>}
                  {(Number(nonAcCount) || 0) > 0 && <p>· {nonAcCount} Non-AC table{Number(nonAcCount) !== 1 ? "s" : ""} with unique QR codes</p>}
                  <p className="text-emerald-600 pt-1 font-medium">· Table numbers auto-assigned in sequence</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError(null); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || ((Number(acCount) || 0) + (Number(nonAcCount) || 0) === 0)}
                  className="btn-primary disabled:opacity-50"
                >
                  {submittingAdd ? "Creating…" : `Create ${(Number(acCount) || 0) + (Number(nonAcCount) || 0)} Table${((Number(acCount) || 0) + (Number(nonAcCount) || 0)) !== 1 ? "s" : ""}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Single Table Print Sticker & View QR ────────────────────── */}
      {printTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1B2A4A]">Table QR Code</h3>
              <button
                onClick={() => setPrintTable(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable sticker */}
            <div className="p-5">
              <div
                id="printable-single"
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center text-center bg-white"
              >
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#D3232A] uppercase">
                  Alayn Dining
                </p>
                <h2 className="text-3xl font-extrabold text-[#1B2A4A] mt-1">
                  Table {printTable.tableNumber}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                    printTable.tableType === "AC"
                      ? "bg-cyan-50 text-cyan-700"
                      : "bg-amber-50 text-amber-700"
                  )}
                >
                  {printTable.tableType === "AC" ? <Wind className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  {printTable.tableType === "AC" ? "Air Conditioned" : "Non-AC"}
                </span>

                <div className="mt-4 mb-3 p-2 border border-gray-100 rounded-xl bg-white shadow-xs">
                  <img
                    src={getQRImageUrl(printTable.currentToken, 220)}
                    alt={`Table ${printTable.tableNumber} QR`}
                    width={220}
                    height={220}
                    className="object-contain"
                  />
                </div>

                <p className="text-xs font-bold text-[#1B2A4A]">SCAN TO VIEW MENU &amp; ORDER</p>
                <p className="text-[10px] text-gray-400 mt-0.5">No app required · Just point your camera</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 pb-5">
              <button
                onClick={() => setPrintTable(null)}
                className="flex-1 btn-ghost"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Sticker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Bulk Print All QRs ──────────────────────────────────────── */}
      {showBulkPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-base font-bold text-[#1B2A4A]">Print All QR Stickers</h3>
                <p className="text-xs text-gray-400 mt-0.5">{tables.length} stickers ready to print</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Sheet
                </button>
                <button
                  onClick={() => setShowBulkPrint(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable sheet */}
            <div id="printable-bulk" className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center text-center"
                >
                  <p className="text-[9px] font-bold tracking-[0.12em] text-[#D3232A] uppercase">
                    Alayn Dining
                  </p>
                  <h4 className="text-lg font-extrabold text-[#1B2A4A] mt-0.5">
                    Table {t.tableNumber}
                  </h4>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {t.tableType === "AC" ? "AC TABLE" : "NON-AC TABLE"}
                  </span>
                  <div className="my-2 p-1 border border-gray-100 rounded-lg">
                    <img
                      src={getQRImageUrl(t.currentToken, 140)}
                      alt={`Table ${t.tableNumber} QR`}
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-[#1B2A4A]">SCAN TO ORDER</p>
                  <p className="text-[9px] text-gray-400">Point camera at QR code</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
