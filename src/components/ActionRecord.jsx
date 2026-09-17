import React from "react";
import { Check, AlertTriangle, Info, ListChecks } from "lucide-react";

const statusConfig = {
  done: { icon: Check, ring: "bg-emerald-100 text-emerald-600", text: "text-slate-700" },
  info: { icon: Info, ring: "bg-slate-100 text-slate-500", text: "text-slate-600" },
  escalation: { icon: AlertTriangle, ring: "bg-red-100 text-red-600", text: "text-slate-700" },
};

export default function ActionRecord({ actions }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Action Record</h2>
      </div>
      {actions.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">No actions recorded yet.</p>
      ) : (
        <ol className="relative space-y-3">
          {actions.map((a, i) => {
            const cfg = statusConfig[a.status] || statusConfig.info;
            const Icon = cfg.icon;
            return (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${cfg.ring}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {i < actions.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-200" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${cfg.text}`}>{a.event}</span>
                    <span className="shrink-0 text-[11px] font-medium text-slate-400">{a.time}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    {a.status === "escalation" ? "Escalation" : a.status === "done" ? "Completed" : "Event"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}