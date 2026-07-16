import React from "react";

export default function Hero() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Good morning, James. Here&apos;s how your<br className="hidden sm:block" /> restaurants are performing today.
        </h2>
        <div className="mt-3 flex items-center text-sm text-gray-600 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          12 of 14 locations are on track
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Today: Oct 24, 2023
        </div>
        
        <button className="bg-[#0B1221] text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg text-sm font-bold shadow-sm cursor-pointer">
          Export Report
        </button>
      </div>
    </div>
  );
}
