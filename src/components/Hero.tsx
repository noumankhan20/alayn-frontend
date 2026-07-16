import React from "react";
import { Calendar, Download } from "lucide-react";

export default function Hero() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Good morning, James. Here&apos;s how your<br className="hidden sm:block" /> restaurants are performing today.
        </h2>
        <div className="mt-3 flex items-center text-sm text-gray-600 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          12 of 14 locations are on track
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex flex-1 sm:flex-none items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="text-sm font-medium text-gray-900">
            <div>Today:</div>
            <div className="text-gray-500 text-xs">Oct 24, 2023</div>
          </div>
        </div>
        
        <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[#0B1221] px-4 py-4 sm:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors h-full">
          <Download className="h-4 w-4" />
          <div className="text-left leading-tight">
            Export<br/>Report
          </div>
        </button>
      </div>
    </div>
  );
}
