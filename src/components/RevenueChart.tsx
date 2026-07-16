"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', actual: 230, forecast: 250, target: 240 },
  { name: 'Tue', actual: 280, forecast: 260, target: 270 },
  { name: 'Wed', actual: 320, forecast: 300, target: 310 },
  { name: 'Thu', actual: 290, forecast: 280, target: 290 },
  { name: 'Fri', actual: 360, forecast: 330, target: 350 },
  { name: 'Sat', actual: 400, forecast: 380, target: 390 },
  { name: 'Sun', actual: 380, forecast: 350, target: 360 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex-1 flex flex-col min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6 sm:gap-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue vs Forecast</h3>
          <p className="text-sm text-gray-500">Daily trend across all 14 locations</p>
        </div>
        <div className="flex gap-6 sm:gap-8 text-right">
          <div>
            <div className="text-sm text-gray-500">Actual</div>
            <div className="text-lg font-bold text-gray-900">£284.6k</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Forecast</div>
            <div className="text-lg font-bold text-gray-900">£276.2k</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Variance</div>
            <div className="text-lg font-bold text-emerald-500">+£8.4k</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        {/* We use an absolute wrapper to let ResponsiveContainer size itself properly */}
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#0B1221" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#64748B" 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#CBD5E1" 
                strokeWidth={2}
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
