import React from "react";
import { Crown, Mail, Phone, History, Plane, Clock, MapPin } from "lucide-react";

const tierStyles = {
  Gold: "bg-amber-50 text-amber-700 border-amber-200",
  Silver: "bg-slate-100 text-slate-600 border-slate-200",
  Platinum: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const statusStyles = {
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Delayed: "bg-amber-50 text-amber-700 border-amber-200",
  Unaffected: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function Row({ icon: Icon, label, value, extra }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-slate-800">{value}</div>
        {extra && <div className="text-xs text-slate-400">{extra}</div>}
      </div>
    </div>
  );
}

export default function CustomerPanel({ customer }) {
  if (!customer) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-sm text-slate-400">
        Select a customer to view their booking details.
      </div>
    );
  }
  const c = customer;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{c.name}</h2>
          <p className="text-xs text-slate-400">Booking Reference · {c.bookingRef}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            tierStyles[c.loyaltyTier]
          }`}
        >
          <Crown className="h-3 w-3" />
          {c.loyaltyTier}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Mail className="h-3 w-3" /> {c.contact.email}
        </span>
        <span className="inline-flex items-center gap-1">
          <Phone className="h-3 w-3" /> {c.contact.phone}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
        <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>
          {c.travelHistory.flightsLast12Months} flights in the last 12 months · {c.travelHistory.priorComplaints}
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Flight
          </span>
          <StatusBadge status={c.flight.status} />
        </div>
        <Row icon={Plane} label="Flight No." value={c.flight.number} />
        <Row icon={MapPin} label="Route" value={c.flight.route} />
        <Row icon={Clock} label="Date" value={c.flight.date} />
        <Row
          icon={Clock}
          label="Scheduled"
          value={c.flight.scheduledDeparture}
          extra={c.flight.newDeparture ? `Now departs ${c.flight.newDeparture}` : c.flight.reason}
        />
      </div>

      {c.returnFlight && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Return Flight
            </span>
            <StatusBadge status={c.returnFlight.status} />
          </div>
          <Row icon={MapPin} label="Route" value={c.returnFlight.route} />
          <Row icon={Clock} label="Date" value={c.returnFlight.date} />
          <Row icon={Clock} label="Scheduled" value={c.returnFlight.scheduledDeparture} />
        </div>
      )}
    </div>
  );
}