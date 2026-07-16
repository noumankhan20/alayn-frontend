import React from 'react';

export default function OperationsSummary() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Operations Summary</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Open Locations</span>
          <span className="text-sm font-bold text-gray-900">14 / 14</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Team Members</span>
          <span className="text-sm font-bold text-gray-900">186</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Average Shift Cost</span>
          <span className="text-sm font-bold text-gray-900">£112</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Food Waste</span>
          <span className="text-sm font-bold text-gray-900">1.8%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Customer Rating</span>
          <span className="text-sm font-bold text-gray-900">4.8★</span>
        </div>
      </div>
    </div>
  );
}
