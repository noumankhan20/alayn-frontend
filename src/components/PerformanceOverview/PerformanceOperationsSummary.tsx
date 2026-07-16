import React from 'react';

interface OperationsSummaryData {
  openLocations: string;
  teamMembers: string;
  tasksCompleted: string;
  criticalIssues: string;
}

const defaultSummary: OperationsSummaryData = {
  openLocations: "14 / 14",
  teamMembers: "186",
  tasksCompleted: "42 / 48 (87.5%)",
  criticalIssues: "1"
};

export default function PerformanceOperationsSummary({ 
  summary = defaultSummary 
}: { 
  summary?: OperationsSummaryData 
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Operations Summary</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Open Locations</span>
          <span className="text-sm font-bold text-gray-900">{summary.openLocations}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Team Members</span>
          <span className="text-sm font-bold text-gray-900">{summary.teamMembers}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Tasks Completed</span>
          <span className="text-sm font-bold text-emerald-600">{summary.tasksCompleted}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-medium text-gray-600">Critical Issues</span>
          <span className="text-sm font-bold text-red-500">{summary.criticalIssues}</span>
        </div>
      </div>
    </div>
  );
}
