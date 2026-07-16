import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  subtext?: string;
  hasProgress?: boolean;
  progressValue?: number;
}

export default function MetricCard({ 
  title, 
  value, 
  trend, 
  trendType = "positive",
  subtext,
  hasProgress,
  progressValue 
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden">
      <div>
        <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">{title}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded",
                trendType === "positive"
                  ? "text-emerald-600 bg-emerald-50"
                  : trendType === "negative"
                  ? "text-red-600 bg-red-50"
                  : "text-gray-600 bg-gray-50"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
      
      {/* Progress or bar at bottom */}
      {hasProgress && progressValue !== undefined ? (
        <div className="mt-6">
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-500" 
              style={{ width: `${progressValue}%` }} 
            />
          </div>
          {subtext && <p className="mt-1 text-xs text-gray-400 font-semibold">{subtext}</p>}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-1">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full w-2/3 rounded-full",
                trendType === "negative" ? "bg-red-500" : "bg-[#0B1221]"
              )}
            />
          </div>
          {subtext && <p className="text-xs text-gray-400 font-semibold">{subtext}</p>}
        </div>
      )}
    </div>
  );
}
