import React from "react";
import { Plane, Wifi } from "lucide-react";
import { TODAY } from "@/lib/agentData";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Airline Resolution Agent
            </h1>
            <p className="text-xs text-slate-500">AI Disruption Resolution · SkyLine Airlines</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Wifi className="h-3.5 w-3.5" />
            Agent Online
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            {TODAY}
          </div>
        </div>
      </div>
    </header>
  );
}