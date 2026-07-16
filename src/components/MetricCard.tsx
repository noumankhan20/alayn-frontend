import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendColor?: string;
  subtext: string;
  hasProgress?: boolean;
  progressValue?: number;
}

export default function MetricCard({ 
  title, 
  value, 
  trend, 
  trendColor = "text-emerald-500",
  subtext,
  hasProgress,
  progressValue 
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className={cn("text-sm font-medium", trendColor)}>
            {trend}
          </div>
        )}
      </div>
      
      {hasProgress && progressValue !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
          <div 
            className="h-1.5 rounded-full bg-emerald-500" 
            style={{ width: `${progressValue}%` }} 
          />
        </div>
      )}
      
      <p className="mt-3 text-sm text-gray-400">{subtext}</p>
    </div>
  );
}
