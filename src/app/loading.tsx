import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1800px] mx-auto w-full h-full space-y-6 bg-[#F4F5F8]">
        {/* Header Skeleton */}
        <div className="h-24 w-full bg-white animate-pulse rounded-xl border border-gray-200 shadow-sm" />
        
        {/* Actions Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-white animate-pulse rounded-lg border border-gray-200" />
          <div className="h-10 w-64 bg-white animate-pulse rounded-lg border border-gray-200" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 w-full bg-white animate-pulse rounded-xl border border-gray-200 shadow-sm flex flex-col p-4 space-y-4">
               <div className="h-32 bg-gray-100 rounded-lg w-full" />
               <div className="h-4 bg-gray-200 rounded w-3/4" />
               <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
