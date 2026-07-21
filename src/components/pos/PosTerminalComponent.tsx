"use client";

import React, { useState } from "react";
import { useGetMenuItemsQuery, useGetCategoriesQuery, MenuItem } from "@/redux/slices/menuApiSlice";
import { useCreateOrderMutation, CreateOrderPayload } from "@/redux/slices/orderApiSlice";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  DollarSign,
  Receipt,
  CheckCircle2,
  Utensils,
  Image as ImageIcon,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import { getImageUrl } from "@/lib/utils";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export default function PosTerminalComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSource, setOrderSource] = useState<"COUNTER" | "QR" /* | "DELIVERY" */>("COUNTER");
  const [tableNo, setTableNo] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "UPI">("UPI");

  // Modals & States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // RTK Query
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: menuItems = [], isLoading } = useGetMenuItemsQuery();
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId === "ALL" || item.categoryId === selectedCategoryId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Financial calculations
  const subtotal = cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;

    const payload: CreateOrderPayload = {
      orderSource,
      tableNo: orderSource === "COUNTER" ? tableNo || "Counter Direct" : tableNo,
      items: cart.map((ci) => ({
        menuItemId: ci.menuItem.id,
        quantity: ci.quantity,
        notes: ci.notes,
      })),
      paymentMethod,
      discountAmount: discount,
      taxAmount: taxAmount,
    };

    try {
      const result = await createOrder(payload).unwrap();
      setCompletedOrder(result);
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Order creation failed:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-auto min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] p-4 max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden bg-[#F4F5F8] text-[#1B2A4A]">
      {/* LEFT: Menu Selection Grid */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pb-3 border-b border-gray-100">
          {/* Order Source Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-full sm:w-auto">
            {(["COUNTER", "QR" /* , "DELIVERY" */] as const).map((src) => (
              <button
                key={src}
                onClick={() => setOrderSource(src)}
                className={`flex-1 sm:flex-initial px-4 py-1 rounded-md text-xs font-bold transition ${
                  orderSource === src
                    ? "bg-[#1B2A4A] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search POS items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-[#D3232A]"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-gray-100">
          <button
            onClick={() => setSelectedCategoryId("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
              selectedCategoryId === "ALL"
                ? "bg-[#D3232A] text-white border-[#D3232A]"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                selectedCategoryId === c.id
                  ? "bg-[#D3232A] text-white border-[#D3232A]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {c.imageUrl && (
                <img
                  src={getImageUrl(c.imageUrl)}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              )}
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-32 bg-gray-100 animate-pulse rounded-lg border border-gray-200" />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <Utensils className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-semibold">No available menu items match filter</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white hover:bg-gray-50/80 border border-gray-200 hover:border-gray-300 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer transition group select-none shadow-sm hover:shadow active:scale-95"
              >
                {/* Optional Image thumbnail in POS grid */}
                {item.imageUrl && (
                  <div className="h-24 w-full bg-gray-100 relative overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      {item.category?.name || "General"}
                    </span>
                    <h4 className="text-xs font-bold text-[#1B2A4A] group-hover:text-[#D3232A] transition mt-0.5 line-clamp-1">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-extrabold text-[#1B2A4A]">
                      ₹{Number(item.price).toFixed(2)}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-[#D3232A]/10 border border-[#D3232A]/20 flex items-center justify-center text-[#D3232A] group-hover:bg-[#D3232A] group-hover:text-white transition">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: POS Order Cart Sidebar */}
      <div className="w-full lg:w-[400px] bg-white border border-gray-200 rounded-xl flex flex-col min-h-0 shadow-sm">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#D3232A]" />
            <h2 className="text-sm font-bold text-[#1B2A4A]">Current Ticket</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Table/Notes Input */}
        <div className="px-4 py-2.5 bg-gray-50/30 border-b border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="Table / Reference Tag..."
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            className="input text-xs"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500">Cart is empty</p>
              <p className="text-[11px] text-gray-400 mt-1">Tap items on left to build order</p>
            </div>
          ) : (
            cart.map((ci) => (
              <div
                key={ci.menuItem.id}
                className="bg-gray-50/60 border border-gray-200 rounded-lg p-3 flex justify-between items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-[#1B2A4A] truncate">{ci.menuItem.name}</h5>
                  <p className="text-[11px] text-gray-500 font-medium">
                    ₹{Number(ci.menuItem.price).toFixed(2)} × {ci.quantity} = ₹
                    {(ci.menuItem.price * ci.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-md shadow-sm">
                  <button
                    onClick={() => updateQuantity(ci.menuItem.id, -1)}
                    className="p-1 hover:bg-gray-100 text-gray-600 rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-[#1B2A4A] px-1">{ci.quantity}</span>
                  <button
                    onClick={() => updateQuantity(ci.menuItem.id, 1)}
                    className="p-1 hover:bg-gray-100 text-gray-600 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Summary Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-2 rounded-b-xl">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tax (5% GST)</span>
            <span className="font-semibold text-gray-800">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#1B2A4A] pt-2 border-t border-gray-200">
            <span>Total Payable</span>
            <span className="text-[#D3232A]">₹{grandTotal.toFixed(2)}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full mt-2 btn-primary py-2.5 text-xs font-bold"
          >
            <Receipt className="w-4 h-4" /> Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 pb-3 border-b border-gray-100">
              <Receipt className="w-5 h-5 text-[#D3232A]" /> Final Checkout
            </h3>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(["UPI", "CARD", "CASH"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                      paymentMethod === method
                        ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {method === "UPI" && <QrCode className="w-4 h-4" />}
                    {method === "CARD" && <CreditCard className="w-4 h-4" />}
                    {method === "CASH" && <DollarSign className="w-4 h-4" />}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Items Subtotal</span>
                <span className="text-gray-800 font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxes & Levies</span>
                <span className="text-gray-800 font-semibold">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1B2A4A] pt-2 border-t border-gray-200">
                <span>Total Due</span>
                <span className="text-[#D3232A]">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="btn-ghost flex-1 text-xs"
              >
                Back to Ticket
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isSubmitting}
                className="btn-primary flex-1 text-xs"
              >
                {isSubmitting ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Order Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-[#1B2A4A]">Order Placed Successfully!</h3>
            <p className="text-xs text-gray-500">
              Order Ref: <span className="font-mono text-[#D3232A] font-bold">{completedOrder.id || "ORD-DONE"}</span>
            </p>
            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full btn-primary py-2 text-xs"
            >
              Next Order
            </button>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
