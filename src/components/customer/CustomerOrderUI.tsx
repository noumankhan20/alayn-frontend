"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Search,
  AlertCircle,
  ChefHat,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchTableMenu,
  CustomerMenuCategory,
  CustomerMenuItem,
} from "@/lib/api";

export default function CustomerOrderUI({ token }: { token: string }) {
  const [categories, setCategories] = useState<CustomerMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [callWaiterNotified, setCallWaiterNotified] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      if (!token) {
        setError("Invalid or missing table QR code token.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await fetchTableMenu(token);
      if (res.ok && res.categories) {
        setCategories(res.categories);
      } else {
        setError(res.error || "Failed to load table menu. Token may be invalid or expired.");
      }
      setLoading(false);
    }

    loadMenu();
  }, [token]);

  const handleCallWaiter = () => {
    setCallWaiterNotified(true);
    setTimeout(() => setCallWaiterNotified(false), 4000);
  };

  // Flattened & filtered items
  const displayCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const filteredItems = cat.menuItems.filter((item) => {
          if (vegOnly && !item.isVeg) return false;
          if (search.trim()) {
            const query = search.toLowerCase();
            return (
              item.name.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query)
            );
          }
          return true;
        });
        return { ...cat, menuItems: filteredItems };
      })
      .filter((cat) =>
        selectedCategory === "ALL" ? cat.menuItems.length > 0 : cat.id === selectedCategory
      );
  }, [categories, selectedCategory, search, vegOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070C16] text-white flex flex-col items-center justify-center p-6">
        <div className="p-4 rounded-full bg-[#D3232A]/20 text-[#D3232A] animate-bounce mb-4">
          <Utensils className="h-8 w-8" />
        </div>
        <p className="text-[#D3232A] font-semibold text-lg animate-pulse">
          Loading Digital Menu...
        </p>
        <p className="text-zinc-500 text-xs mt-1">Setting up your dining experience</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070C16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 mb-4">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">QR Code Issue</h2>
        <p className="text-zinc-400 text-sm max-w-sm mb-6">{error}</p>
        <p className="text-xs text-zinc-500">
          Please ask restaurant staff to check your table QR code sticker.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070C16] text-white pb-24">
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0B1221]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#D3232A] flex items-center justify-center text-white font-bold shadow-md shadow-[#D3232A]/30">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Alayn Dining</h1>
            <p className="text-[11px] text-emerald-400 font-medium leading-none mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Digital Menu (View Only)
            </p>
          </div>
        </div>

        <button
          onClick={handleCallWaiter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D3232A]/20 hover:bg-[#D3232A] text-[#D3232A] hover:text-white border border-[#D3232A]/30 text-xs font-bold transition-all"
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Call Waiter</span>
        </button>
      </header>

      {/* Call Waiter notification toast */}
      {callWaiterNotified && (
        <div className="fixed top-16 inset-x-4 z-40 max-w-md mx-auto bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <span>🔔 Waiter has been notified! They'll be at your table shortly.</span>
        </div>
      )}

      {/* ── Banner: Order via Waiter ─────────────────────────────────── */}
      <div className="bg-[#D3232A]/10 border-b border-[#D3232A]/20 px-4 py-2.5 text-center">
        <p className="text-xs font-semibold text-zinc-200">
          📖 Browse the menu below &amp; inform your waiter to place your order.
        </p>
      </div>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Search & Veg Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search food or drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1221] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D3232A]"
            />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all shrink-0",
              vegOnly
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-[#0B1221] text-zinc-400 border-white/10 hover:text-white"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full border border-emerald-500 flex items-center justify-center p-0.5",
                vegOnly && "bg-emerald-500"
              )}
            />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
              selectedCategory === "ALL"
                ? "bg-[#D3232A] text-white shadow-md shadow-[#D3232A]/20"
                : "bg-[#0B1221] text-zinc-400 border border-white/10 hover:text-white"
            )}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                selectedCategory === cat.id
                  ? "bg-[#D3232A] text-white shadow-md shadow-[#D3232A]/20"
                  : "bg-[#0B1221] text-zinc-400 border border-white/10 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Categories & Items List */}
        {displayCategories.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Utensils className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-zinc-400">No menu items found</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting your search or veg filter</p>
          </div>
        ) : (
          displayCategories.map((cat) => (
            <section key={cat.id} className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <h2 className="text-base font-bold text-white tracking-wide">{cat.name}</h2>
                <span className="text-xs text-zinc-500">{cat.menuItems.length} items</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {cat.menuItems.map((item) => {
                  const priceRupees = (item.pricePaise / 100).toFixed(2);

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-3.5 rounded-2xl bg-[#0B1221] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    >
                      <div className="flex items-start gap-3 flex-1 pr-3">
                        {/* Veg / Non-Veg Indicator */}
                        <span
                          className={cn(
                            "mt-1 shrink-0 h-4 w-4 rounded-sm border flex items-center justify-center p-0.5",
                            item.isVeg
                              ? "border-emerald-500 text-emerald-500"
                              : "border-rose-500 text-rose-500"
                          )}
                          title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                            )}
                          />
                        </span>

                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-[#D3232A]">
                          ₹{priceRupees}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
