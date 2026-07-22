"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Package, AlertCircle } from "lucide-react";

interface InventoryItemData {
  item: string;
  currentStock: number;
  threshold: number;
  daysRemaining: number;
}

interface InventoryForecastChartProps {
  data?: InventoryItemData[];
  isLoading?: boolean;
}

const DEFAULT_INVENTORY_DATA: InventoryItemData[] = [
  { item: "Specialty Coffee Beans (kg)", currentStock: 42, threshold: 25, daysRemaining: 3 },
  { item: "Full Cream Milk (L)", currentStock: 14, threshold: 20, daysRemaining: 1.5 },
  { item: "Avocado Crates", currentStock: 88, threshold: 40, daysRemaining: 6 },
  { item: "Syrup Vanilla 750ml", currentStock: 120, threshold: 50, daysRemaining: 8 },
  { item: "Brioche Burger Buns", currentStock: 28, threshold: 30, daysRemaining: 2 },
];

export default function InventoryForecastChart({
  data = [],
  isLoading = false,
}: InventoryForecastChartProps) {
  const lowStockItemsCount = data.filter(item => item.currentStock <= item.threshold).length;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs border border-gray-200/80 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Inventory Stock & Depletion</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Key ingredient levels nearing safety stock reorder point
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col h-full w-full items-center justify-center text-center p-4">
            <Package className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-400">No inventory items tracked yet</p>
            <p className="text-[10px] text-gray-400 max-w-[200px] mt-0.5">Stock levels will appear here once items are added to your inventory.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                type="category"
                dataKey="item"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#1E293B", fontSize: 11, fontWeight: 600 }}
                width={140}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#94A3B8", fontWeight: 500 }}
                labelStyle={{ color: "#FFFFFF", fontWeight: 700, marginBottom: "4px" }}
                formatter={(value: any, name: any, item: any) => [
                  `${value} units (${item.payload.daysRemaining} days left)`,
                  "Current Stock",
                ]}
              />
              <Bar dataKey="currentStock" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, index) => {
                  const isLow = entry.currentStock <= entry.threshold;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isLow ? "#DC2626" : "#2563EB"}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-gray-500">
        <div className={`flex items-center gap-1.5 font-semibold ${
          lowStockItemsCount > 0 ? "text-rose-700" : "text-gray-400"
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span>
            {lowStockItemsCount === 0
              ? "All items above safety stock threshold"
              : `${lowStockItemsCount} item${lowStockItemsCount !== 1 ? "s" : ""} below safety stock threshold`
            }
          </span>
        </div>
        <button className="text-gray-700 hover:text-gray-900 transition-colors font-semibold cursor-pointer">
          Manage Stock →
        </button>
      </div>
    </div>
  );
}
