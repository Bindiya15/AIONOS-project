import React from "react";
import { AlertTriangle, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function EscalationCard({ escalation }) {
  if (!escalation) return null;

  const isHuman = escalation.type === "human";

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-sm ${
        isHuman ? "border-red-300" : "border-amber-300"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 ${
          isHuman ? "bg-red-600 text-white" : "bg-amber-500 text-white"
        }`}
      >
        {isHuman ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {isHuman ? "Immediate Human Escalation" : "Escalation Required"}
        </h2>
      </div>
      <div className={`space-y-3 p-4 ${isHuman ? "bg-red-50" : "bg-amber-50"}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
          <p className="mt-0.5 text-sm font-medium text-slate-800">{escalation.reason}</p>
        </div>
        {escalation.details && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(escalation.details).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
          <ArrowUpRight className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600">
            {isHuman
              ? "Agent will not continue resolving this request automatically."
              : "Pending supervisor review — agent authority exceeded."}
          </span>
        </div>
      </div>
    </div>
  );
}