import DashboardLayout from "@/components/layout/DashboardLayout";
import Hero from "@/components/Hero";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import InsightsPanel from "@/components/InsightsPanel";
import OperationsSummary from "@/components/OperationsSummary";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <Hero />
        
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

        {/* Main Content Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (Chart) */}
          <div className="xl:col-span-2 flex flex-col">
            <RevenueChart />
          </div>

          {/* Right Column (Insights & Summary) */}
          <div className="flex flex-col">
            <InsightsPanel />
            <OperationsSummary />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
