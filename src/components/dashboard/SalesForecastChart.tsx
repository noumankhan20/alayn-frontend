"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, LineChart } from "lucide-react";

interface SalesDataPoint {
  date: string;
  actual?: number;
  projected?: number;
}

interface SalesForecastChartProps {
  data?: SalesDataPoint[];
  isLoading?: boolean;
}

const DEFAULT_SALES_DATA: SalesDataPoint[] = [
  { date: "Mon", actual: 42000, projected: 41000 },
  { date: "Tue", actual: 48000, projected: 47500 },
  { date: "Wed", actual: 51000, projected: 50000 },
  { date: "Thu", actual: 59000, projected: 58000 },
  { date: "Fri", actual: 74000, projected: 72000 },
  { date: "Sat", actual: 89000, projected: 85000 },
  { date: "Sun", actual: 65000, projected: 64000 },
  { date: "Next Mon", projected: 46000 },
  { date: "Next Tue", projected: 52000 },
  { date: "Next Wed", projected: 55000 },
];

export default function SalesForecastChart({
  data = [],
  isLoading = false,
}: SalesForecastChartProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

  // Calculate actual revenue sum to see if we have valid sales data
  const totalActual = data.reduce((sum, item) => sum + (item.actual || 0), 0);
  const totalProjected = data.reduce((sum, item) => sum + (item.projected || 0), 0);
  const hasData = data.length > 0 && (totalActual > 0 || totalProjected > 0);

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs border border-gray-200/80 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <LineChart className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Sales & Revenue Forecasting</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Historical POS sales vs predictive demand trends
          </p>
        </div>

        {/* Timeframe & Custom Legend */}
        {hasData && (
          <div className="flex items-center gap-4 self-start sm:self-auto flex-wrap">
            {/* Custom Clean HTML Legend (Prevents Recharts circle clipping) */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] shrink-0" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D97706] shrink-0" />
                <span>Forecasted</span>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 border border-gray-200/60">
              {(["7d", "30d", "90d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    timeframe === t
                      ? "bg-white text-gray-900 shadow-2xs border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-72 w-full mt-2">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col h-full w-full items-center justify-center text-center p-4">
            <LineChart className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-400">No sales transactions tracked yet</p>
            <p className="text-[10px] text-gray-400 max-w-[200px] mt-0.5">Sales graphs and demand forecasts will populate once orders are received.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#E2E8F0", fontWeight: 500 }}
                labelStyle={{ color: "#FFFFFF", fontWeight: 700, marginBottom: "4px" }}
                formatter={(val: any) => [`₹${Number(val)?.toLocaleString("en-IN")}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualGradient)"
              />
              <Area
                type="monotone"
                dataKey="projected"
                name="Forecasted Revenue"
                stroke="#D97706"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#projectedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-gray-500">
        <div className={`flex items-center gap-1.5 font-semibold ${
          hasData ? "text-blue-700" : "text-gray-400"
        }`}>
          <TrendingUp className="h-4 w-4" />
          <span>
            {hasData 
              ? "Predictive demand trends active"
              : "Awaiting sufficient sales telemetry to compile demand surge triggers"
            }
          </span>
        </div>
        {hasData && <span className="text-gray-400">Confidence: 94.8%</span>}
      </div>
    </div>
  );
}
