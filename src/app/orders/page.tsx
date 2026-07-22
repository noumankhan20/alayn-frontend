"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  Order,
} from "@/redux/slices/orderApiSlice";
import { useAppSelector } from "@/redux/store/hooks";
import { useBranch } from "@/lib/BranchContext";
import { fetchTables, TableItem } from "@/lib/api";
import { useGetEmployeesQuery } from "@/redux/slices/employeeApiSlice";
import {
  Utensils,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  ChefHat,
  AlertCircle,
  QrCode,
  DollarSign,
  ChevronRight,
  Filter,
  UserCheck,
  CreditCard,
  Banknote,
  Check,
} from "lucide-react";

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  SENT_TO_KITCHEN: { bg: "bg-[#1B2A4A]/10", text: "text-[#1B2A4A]", border: "border-[#1B2A4A]/20" },
  RECEIVED: { bg: "bg-[#1B2A4A]/10", text: "text-[#1B2A4A]", border: "border-[#1B2A4A]/20" },
  PREPARING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  READY: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  SERVED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  DISPATCHED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  COMPLETED: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

const formatStatusLabel = (status: string) => {
  if (status === "SENT_TO_KITCHEN" || status === "RECEIVED") return "SENT TO KITCHEN";
  return status;
};

export default function LiveOrdersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { activeBranch } = useBranch();
  const currentOutletId = activeBranch?.id && activeBranch.id !== "all" ? activeBranch.id : null;
  const isStaffRole = user?.role === "STAFF";

  // Workforce employee record
  const { data: employeesRaw } = useGetEmployeesQuery(
    currentOutletId ? { outletId: currentOutletId, limit: 200, offset: 0 } : undefined,
    { skip: !currentOutletId || !isStaffRole }
  );
  const allEmployees: any[] = Array.isArray(employeesRaw)
    ? employeesRaw
    : (employeesRaw as any)?.data || [];
  const myEmployee = allEmployees.find((e: any) => e.userId === user?.id);

  // Staff assigned table numbers
  const [assignedTableNumbers, setAssignedTableNumbers] = useState<number[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    async function loadTables() {
      if (!currentOutletId || !isStaffRole) return;
      setLoadingTables(true);
      const res = await fetchTables(currentOutletId);
      if (res.ok && res.tables) {
        const userId = user?.id;
        const empId = myEmployee?.id;
        if (userId || empId) {
          const assigned = res.tables.filter(
            (t) =>
              (t.assignedStaffId && (t.assignedStaffId === userId || t.assignedStaffId === empId)) ||
              ((t as any).staffId && ((t as any).staffId === userId || (t as any).staffId === empId))
          );
          setAssignedTableNumbers(assigned.map((t) => t.tableNumber));
        } else {
          setAssignedTableNumbers([]);
        }
      }
      setLoadingTables(false);
    }
    loadTables();
  }, [currentOutletId, myEmployee?.id, user?.id, isStaffRole]);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "UPI">("CASH");

  // Poll every 4 seconds for live kitchen updates
  const { data: orders = [], isLoading, isFetching, refetch } = useGetOrdersQuery(
    selectedStatusFilter !== "ALL" ? { status: selectedStatusFilter } : undefined,
    { pollingInterval: 4000 }
  );

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (
    orderId: string,
    nextStatus: Order["status"],
    methodOrComment?: "CASH" | "CARD" | "UPI" | string
  ) => {
    try {
      const isPaymentMethod = methodOrComment === "CASH" || methodOrComment === "CARD" || methodOrComment === "UPI";
      await updateOrderStatus({
        id: orderId,
        status: nextStatus,
        comment: methodOrComment,
        paymentMethod: isPaymentMethod ? (methodOrComment as any) : undefined,
      }).unwrap();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const orderList = Array.isArray(orders)
    ? orders
    : (orders as any)?.data && Array.isArray((orders as any).data)
      ? (orders as any).data
      : [];

  const filteredOrders = orderList.filter((order: Order) => {
    const tableNum = order.tableNo !== undefined && order.tableNo !== null
      ? Number(order.tableNo)
      : (order as any).tableNumber !== undefined && (order as any).tableNumber !== null
        ? Number((order as any).tableNumber)
        : null;

    // Staff filter: STAFF users can only see orders from tables assigned to them
    if (isStaffRole) {
      if (tableNum === null) return false; // Exclude Counter / non-table orders for staff
      if (!assignedTableNumbers.includes(tableNum)) return false; // Exclude orders of tables assigned to other staff
    }

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((order as any).orderNumber && (order as any).orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tableNum !== null && String(tableNum).includes(searchQuery));
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#1B2A4A] flex items-center gap-2">
              <Utensils className="w-6 h-6 text-[#D3232A]" />
              Live Orders & Kitchen Status
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Track live order statuses across tables, dishes ordered, and kitchen preparation stages.</span>
              {isStaffRole && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                  <UserCheck className="w-3 h-3 text-amber-600" />
                  My Assigned Tables Only ({assignedTableNumbers.length > 0 ? assignedTableNumbers.map((n) => `T${n}`).join(", ") : "None Assigned"})
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-2xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#D3232A]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
            {["ALL", "SENT_TO_KITCHEN", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"].map((status) => {
              const active = selectedStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${active
                      ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {status === "ALL" ? "All Orders" : formatStatusLabel(status)}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Table or Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#D3232A]"
            />
          </div>
        </div>

        {/* Orders List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 space-y-3">
            <ChefHat className="w-12 h-12 mx-auto opacity-30 text-gray-500" />
            <p className="text-sm font-semibold text-gray-600">No orders found</p>
            <p className="text-xs text-gray-400">Orders placed by staff or QR customers will appear here live.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order: any) => {
              const statusStyle = STATUS_COLOR_MAP[order.status] || STATUS_COLOR_MAP["RECEIVED"];
              const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const orderNumDisplay =
                order.orderNo || order.orderNumber || `#${order.id.slice(0, 8)}`;
              const orderSourceDisplay = order.orderSource || order.source || "TABLE";
              const tableNumDisplay =
                order.tableNo !== undefined && order.tableNo !== null
                  ? order.tableNo
                  : order.tableNumber !== undefined && order.tableNumber !== null
                  ? order.tableNumber
                  : null;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        {tableNumDisplay !== null ? (
                          <span className="px-2.5 py-1 bg-[#D3232A]/10 text-[#D3232A] text-xs font-black rounded-lg border border-[#D3232A]/20">
                            Table {tableNumDisplay}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-black rounded-lg border border-gray-200">
                            Counter Order
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-gray-500">
                          {orderNumDisplay}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </div>

                    {/* Order Details Meta */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formattedTime}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-semibold text-[10px]">
                        Source: {orderSourceDisplay}
                      </span>
                    </div>

                    {/* Dishes Breakdown List */}
                    <div className="mt-3 bg-gray-50/70 border border-gray-100 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto scrollbar-none">
                      {(order.orderItems || order.items) && (order.orderItems || order.items).length > 0 ? (
                        (order.orderItems || order.items).map((item: any, idx: number) => (
                          <div key={item.id || idx} className="flex justify-between items-start text-xs">
                            <span className="font-bold text-[#1B2A4A] truncate max-w-[180px]">
                              {item.quantity}× {item.menuItem?.name || "Dish Item"}
                            </span>
                            <span className="text-gray-500 font-semibold text-[11px]">
                              ₹
                              {(
                                (Number(
                                  item.unitPricePaise !== undefined
                                    ? item.unitPricePaise
                                    : item.menuItem?.price
                                    ? item.menuItem.price * 100
                                    : 0
                                ) /
                                  100) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">No item details</p>
                      )}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-[#1B2A4A] hover:text-[#D3232A] transition flex items-center gap-1"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Status Progression Button */}
                    {!isStaffRole && (order.status === "SENT_TO_KITCHEN" || (order.status as string) === "RECEIVED") && (
                      <button
                        onClick={() => handleStatusChange(order.id, "PREPARING")}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-extrabold rounded-lg border border-amber-200 transition"
                      >
                        Start Prep
                      </button>
                    )}
                    {!isStaffRole && order.status === "PREPARING" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "READY")}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-lg border border-emerald-200 transition"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === "READY" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "SERVED")}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-extrabold rounded-lg border border-purple-200 transition"
                      >
                        Mark Served
                      </button>
                    )}
                    {order.status === "SERVED" && (
                      <button
                        onClick={() => setSettlingOrder(order)}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg shadow-xs transition"
                      >
                        Complete Order & Free Table
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Full Order View */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-black text-[#1B2A4A]">
                    {selectedOrder.orderNo || (selectedOrder as any).orderNumber || `#${selectedOrder.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedOrder.tableNo || (selectedOrder as any).tableNumber
                      ? `Table ${selectedOrder.tableNo || (selectedOrder as any).tableNumber}`
                      : "Counter"}{" "}
                    • Source: {selectedOrder.orderSource || (selectedOrder as any).source || "TABLE"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-semibold text-gray-600">Kitchen Status</span>
                <span
                  className={`px-3 py-1 text-xs font-black rounded-full border ${
                    STATUS_COLOR_MAP[selectedOrder.status]?.bg
                  } ${STATUS_COLOR_MAP[selectedOrder.status]?.text} ${
                    STATUS_COLOR_MAP[selectedOrder.status]?.border
                  }`}
                >
                  {formatStatusLabel(selectedOrder.status)}
                </span>
              </div>

              {/* Dishes List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedOrder.orderItems || (selectedOrder as any).items)?.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="flex justify-between items-start p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1B2A4A] block">
                          {item.quantity}× {item.menuItem?.name || "Dish Item"}
                        </span>
                        {item.notes && <span className="text-[10px] text-gray-500 italic">{item.notes}</span>}
                      </div>
                      <span className="font-bold text-gray-800">
                        ₹
                        {(
                          (Number(
                            item.unitPricePaise !== undefined
                              ? item.unitPricePaise
                              : item.menuItem?.price
                              ? item.menuItem.price * 100
                              : 0
                          ) /
                            100) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {(
                      selectedOrder.subtotal !== undefined
                        ? selectedOrder.subtotal
                        : (selectedOrder as any).subtotalPaise !== undefined
                        ? (selectedOrder as any).subtotalPaise / 100
                        : 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#1B2A4A] pt-1">
                  <span>Total Amount</span>
                  <span className="text-[#D3232A]">
                    ₹
                    {(
                      selectedOrder.totalAmount !== undefined
                        ? selectedOrder.totalAmount
                        : (selectedOrder as any).totalPaise !== undefined
                        ? (selectedOrder as any).totalPaise / 100
                        : 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                {selectedOrder.status !== "COMPLETED" && selectedOrder.status !== "CANCELLED" && (
                  <button
                    onClick={() => {
                      setSettlingOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 text-xs rounded-xl transition shadow-xs"
                  >
                    Complete Order & Free Table
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Settle Payment & Complete Order */}
        {settlingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-black text-[#1B2A4A] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Settle Bill & Complete Order
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {settlingOrder.orderNo || (settlingOrder as any).orderNumber || `#${settlingOrder.id.slice(0, 8)}`} •{" "}
                    {settlingOrder.tableNo || (settlingOrder as any).tableNumber
                      ? `Table ${settlingOrder.tableNo || (settlingOrder as any).tableNumber}`
                      : "Counter Direct"}
                  </p>
                </div>
                <button
                  onClick={() => setSettlingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Bill Amount Summary Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Bill Amount</p>
                  <p className="text-2xl font-black text-emerald-900 mt-0.5">
                    ₹
                    {(
                      settlingOrder.totalAmount !== undefined
                        ? settlingOrder.totalAmount
                        : (settlingOrder as any).totalPaise !== undefined
                        ? (settlingOrder as any).totalPaise / 100
                        : 0
                    ).toFixed(2)}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-200/60 text-emerald-900 font-extrabold text-[10px] rounded-lg uppercase">
                  Ready for Settlement
                </span>
              </div>

              {/* Select Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Select Customer Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-bold text-xs ${
                      paymentMethod === "CASH"
                        ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-bold text-xs ${
                      paymentMethod === "CARD"
                        ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Card / POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-bold text-xs ${
                      paymentMethod === "UPI"
                        ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    UPI / QR
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={async () => {
                    const orderId = settlingOrder.id;
                    setSettlingOrder(null);
                    await handleStatusChange(orderId, "COMPLETED", paymentMethod);
                  }}
                  disabled={isUpdating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Payment & Free Table
                </button>
                <button
                  onClick={() => setSettlingOrder(null)}
                  className="px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
