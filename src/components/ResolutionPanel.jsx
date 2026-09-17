import React from "react";
import { Check, X, CircleDot, ShieldCheck } from "lucide-react";

const statusConfig = {
  done: { icon: Check, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Done" },
  eligible: { icon: CircleDot, color: "text-slate-500 bg-slate-50 border-slate-200", label: "Eligible" },
  notEligible: { icon: X, color: "text-red-500 bg-red-50 border-red-200", label: "Not eligible" },
};

export default function ResolutionPanel({ resolution }) {
  if (!resolution) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-sm text-slate-400">
        Resolution details appear here once a customer is selected.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Resolution</h2>
      </div>
      <div className="space-y-2">
        {resolution.items.map((item, i) => {
          const cfg = statusConfig[item.status];
          const Icon = cfg.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-3 ${cfg.color}`}
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}