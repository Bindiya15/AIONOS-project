import React from "react";
import { customerList, demoButtons } from "@/lib/agentData";
import { UserCircle, FlaskConical } from "lucide-react";

export default function CustomerSelector({ selectedId, onSelect }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <UserCircle className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Select Customer</h2>
      </div>
      <div className="space-y-2">
        {customerList.map((c) => {
          const active = selectedId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {c.scenario}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Demo Scenarios
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {demoButtons.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}