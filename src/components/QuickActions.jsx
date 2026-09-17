import React from "react";
import { Zap } from "lucide-react";
import { quickActionsByCustomer } from "@/lib/agentData";

export default function QuickActions({ customerId, onAction, disabled }) {
  const actions = customerId ? quickActionsByCustomer[customerId] : [];
  if (!customerId) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction(a.id)}
            disabled={disabled}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}