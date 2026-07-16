import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/MetricCard";
import { 
  PerformanceOverview, 
  PerformanceRevenueChart, 
  PerformanceOperationsSummary 
} from "@/components/PerformanceOverview";
import InsightsPanel from "@/components/InsightsPanel";

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Performance Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              All locations operations are synchronized and on track
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Today: Oct 24, 2023
            </div>
            <button className="bg-[#0B1221] text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Net Sales"
            value="£284,620"
            trend="+8.4%"
            subtext="vs last week"
          />
          <MetricCard 
            title="Labour Cost"
            value="26.8%"
            trend="-1.2 pts"
            subtext="vs target"
          />
          <MetricCard 
            title="Gross Profit"
            value="£191,340"
            subtext="67.2% margin"
            hasProgress={true}
            progressValue={67.2}
          />
          <MetricCard 
            title="Forecast Accuracy"
            value="94.6%"
            trend="+3.1%"
            subtext="Week-to-date"
          />
        </div>

        {/* Row 1: Chart (2/3 width) and Insights + Summary (1/3 width) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 flex flex-col">
            <PerformanceRevenueChart />
          </div>
          <div className="flex flex-col gap-6">
            <InsightsPanel />
            <PerformanceOperationsSummary />
          </div>
        </div>

        {/* Row 2: Location Performance Table (Full width) */}
        <div className="w-full">
          <PerformanceOverview />
        </div>
      </div>
    </DashboardLayout>
  );
}
