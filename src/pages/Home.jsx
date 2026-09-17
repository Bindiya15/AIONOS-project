import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import CustomerSelector from "@/components/CustomerSelector";
import CustomerPanel from "@/components/CustomerPanel";
import ChatPanel from "@/components/ChatPanel";
import QuickActions from "@/components/QuickActions";
import ResolutionPanel from "@/components/ResolutionPanel";
import ActionRecord from "@/components/ActionRecord";
import EscalationCard from "@/components/EscalationCard";
import { customers } from "@/lib/agentData";
import {
  getInitialGreeting,
  initActions,
  getResolution,
  generateResponse,
  performQuickAction,
  nowTime,
} from "@/lib/agentEngine";

export default function Home() {
  const [customerId, setCustomerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [actions, setActions] = useState([]);
  const [escalation, setEscalation] = useState(null);
  const [completed, setCompleted] = useState({});

  const customer = customerId ? customers[customerId] : null;
  const resolution = customer ? getResolution(customer, completed) : null;

  const handleSelect = useCallback((id) => {
    const c = customers[id];
    setCustomerId(id);
    setMessages([{ role: "agent", text: getInitialGreeting(c), time: nowTime() }]);
    setActions(initActions(c));
    setEscalation(null);
    setCompleted({});
  }, []);

  const applyResult = useCallback(
    (result) => {
      if (!result) return;
      if (result.reply) {
        setMessages((prev) => [...prev, { role: "agent", text: result.reply, time: nowTime() }]);
      }
      if (result.actions && result.actions.length) {
        setActions((prev) => [...prev, ...result.actions]);
      }
      if (result.escalate) {
        setEscalation(result.escalate);
      }
      if (result.complete) {
        setCompleted((prev) => ({ ...prev, ...result.complete }));
      }
    },
    []
  );

  const handleSend = useCallback(
    (text) => {
      if (!customer) return;
      setMessages((prev) => [...prev, { role: "customer", text, time: nowTime() }]);
      const result = generateResponse(text, customer, completed);
      applyResult(result);
    },
    [customer, completed, applyResult]
  );

  const handleQuickAction = useCallback(
    (actionId) => {
      if (!customer) return;
      const result = performQuickAction(actionId, customer, completed);
      applyResult(result);
    },
    [customer, completed, applyResult]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-5 lg:col-span-3">
            <CustomerSelector selectedId={customerId} onSelect={handleSelect} />
            <CustomerPanel customer={customer} />
            <QuickActions customerId={customerId} onAction={handleQuickAction} disabled={!customer} />
          </div>

          {/* Middle column - chat */}
          <div className="lg:col-span-5">
            <ChatPanel messages={messages} onSend={handleSend} disabled={!customer} />
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-4">
            {escalation && <EscalationCard escalation={escalation} />}
            <ResolutionPanel resolution={resolution} />
            <ActionRecord actions={actions} />
          </div>
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-4 pb-8 text-center text-xs text-slate-400">
          Airline Resolution Agent · Prototype demo · Uses only supplied customer, booking & policy data
        </footer>
      </main>
    </div>
  );
}