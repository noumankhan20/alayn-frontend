import React from 'react';
import { AlertTriangle, TrendingUp, Info, ArrowRight, Sparkles } from 'lucide-react';

export default function InsightsPanel() {
  return (
    <div className="rounded-xl bg-[#0B1221] text-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-bold">Alayn Insights</h3>
      </div>

      <div className="space-y-4">
        {/* Insight 1 */}
        <div className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-200 leading-snug mb-3">
                Labour cost at Manchester Deansgate projected to exceed target by 3.4%
              </p>
              <a href="#" className="text-sm font-medium text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Review Schedule <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Insight 2 */}
        <div className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-200 leading-snug mb-3">
                Birmingham Bullring outperforming sales forecast by ₹4,280
              </p>
              <a href="#" className="text-sm font-medium text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                View Performance <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Insight 3 */}
        <div className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-200 leading-snug mb-3">
                Inventory audit suggested for London Soho following high waste trends.
              </p>
              <a href="#" className="text-sm font-medium text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Audit <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
