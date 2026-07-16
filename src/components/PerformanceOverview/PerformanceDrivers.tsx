import React from "react";
import { Rocket, ArrowRight } from "lucide-react";

export default function PerformanceDrivers() {
  return (
    <div className="rounded-xl bg-[#0B1221] text-white p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[400px]">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Rocket className="h-5 w-5 text-red-500 fill-red-500" />
          <h3 className="text-lg font-bold">Performance Drivers</h3>
        </div>
        
        <div className="space-y-4">
          {/* Driver 1: Positive */}
          <div className="rounded-lg bg-white/5 p-4 border-l-4 border-emerald-500 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
              Positive Trend
            </div>
            <p className="text-sm text-gray-200 leading-snug mb-3">
              Dinner sales increased <span className="font-bold text-white">14%</span> across London Soho locations this week.
            </p>
            <a href="#" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              View segment detail <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Driver 2: Negative */}
          <div className="rounded-lg bg-white/5 p-4 border-l-4 border-red-500 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="text-xs font-bold text-red-400 tracking-wider uppercase mb-1">
              Negative Variance
            </div>
            <p className="text-sm text-gray-200 leading-snug mb-3">
              Delivery revenue declined <span className="font-bold text-white">6.2%</span> in Manchester due to aggregator downtime.
            </p>
            <a href="#" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              View segment detail <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
