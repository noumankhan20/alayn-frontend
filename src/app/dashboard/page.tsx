"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KPIWidget from "@/components/dashboard/KPIWidget";
import SalesForecastChart from "@/components/dashboard/SalesForecastChart";
import InventoryForecastChart from "@/components/dashboard/InventoryForecastChart";
import { useBranch } from "@/lib/BranchContext";
import {
  IndianRupee,
  TrendingUp,
  Users,
  Percent,
  RefreshCw,
  Zap,
  ShoppingBag,
  Clock,
  Lightbulb,
  Building2,
} from "lucide-react";
import {
  useGetKpisQuery,
  useGetSalesForecastQuery,
  useGetInventoryForecastQuery,
} from "@/redux/slices/dashboardApiSlice";

export default function MasterDashboardPage() {
  const { activeBranch } = useBranch();
  const outletId = activeBranch?.id === "all" ? undefined : activeBranch?.id;

  const { data: kpiData, isLoading: isKpiLoading, refetch } = useGetKpisQuery({ outletId });
  const { data: salesData, isLoading: isSalesLoading } = useGetSalesForecastQuery({ outletId });
  const { data: inventoryData, isLoading: isInventoryLoading } = useGetInventoryForecastQuery({ outletId });

  const kpis = {
    totalRevenue: kpiData?.totalRevenue || { value: "₹14,89,200", change: "+14.2%", isPositive: true },
    cogs: kpiData?.cogs || { value: "₹4,17,000", change: "-2.8%", isPositive: true },
    grossProfit: kpiData?.grossProfit || { value: "₹10,72,200", change: "+18.5%", isPositive: true },
    laborCosts: kpiData?.laborCosts || { value: "₹3,24,000", change: "+4.1%", isPositive: false },
    netMargin: kpiData?.netMargin || { value: "31.4%", change: "+3.2%", isPositive: true },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1221] p-6 lg:p-7 rounded-2xl text-white shadow-sm border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <Zap className="h-3.5 w-3.5" />
                Live Sync Active
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Outlet: <strong className="text-white">{activeBranch?.name || "All Outlets"}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Executive Overview & Analytics
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Multi-outlet POS telemetry, P&L financial summary, labor analysis, and stock forecasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* P&L Summary Metric Grid - Fully Responsive */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="h-4.5 w-4.5 text-[#D3232A]" />
              P&L Financial Performance
            </h2>
            <span className="text-xs font-medium text-gray-500">Current Month (MTD)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <KPIWidget
              title="Total Revenue"
              value={kpis.totalRevenue.value}
              change={kpis.totalRevenue.change}
              isPositive={kpis.totalRevenue.isPositive}
              subtext="Gross sales across channels"
              icon={IndianRupee}
            />
            <KPIWidget
              title="COGS"
              value={kpis.cogs.value}
              change={kpis.cogs.change}
              isPositive={kpis.cogs.isPositive}
              subtext="28% of total revenue"
              icon={ShoppingBag}
            />
            <KPIWidget
              title="Gross Profit"
              value={kpis.grossProfit.value}
              change={kpis.grossProfit.change}
              isPositive={kpis.grossProfit.isPositive}
              subtext="Margin after direct costs"
              icon={TrendingUp}
            />
            <KPIWidget
              title="Labor Costs"
              value={kpis.laborCosts.value}
              change={kpis.laborCosts.change}
              isPositive={kpis.laborCosts.isPositive}
              subtext="Hourly & salaried shifts"
              icon={Users}
            />
            <KPIWidget
              title="Net Margins"
              value={kpis.netMargin.value}
              change={kpis.netMargin.change}
              isPositive={kpis.netMargin.isPositive}
              subtext="Target: >30.0%"
              icon={Percent}
              badge="Top 5%"
            />
          </div>
        </div>

        {/* Main Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesForecastChart data={salesData} isLoading={isSalesLoading} />
          <InventoryForecastChart data={inventoryData} isLoading={isInventoryLoading} />
        </div>

        {/* Real-time Insights & Activity Feed */}
        <div className="rounded-xl bg-white p-5 shadow-xs border border-gray-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Operational Insights</h3>
                <p className="text-xs text-gray-500 font-medium">Automated revenue and cost optimization recommendations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200/70">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs mb-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                Shift Staffing Adjustment
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Friday dinner rush predicted to be 18% higher than average. Recommend scheduling 2 extra line cooks for the 6 PM - 10 PM shift.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200/70">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs mb-1.5">
                <ShoppingBag className="h-4 w-4 text-amber-600" />
                Menu Margin Optimization
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Ingredient costs increased 4.2%. Increasing menu price by ₹20 will preserve net margin without impacting order volume.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200/70">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs mb-1.5">
                <Zap className="h-4 w-4 text-emerald-600" />
                Waste Reduction Trigger
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Fresh produce spoilage risk low due to weekend promo. Estimated waste savings: ₹28,000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
