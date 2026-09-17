import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

export default function ChatPanel({ messages, onSend, disabled }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Resolution Chat</h2>
          <p className="text-[11px] text-slate-400">Agent responds per supplied policy</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ minHeight: "320px", maxHeight: "calc(100vh - 360px)" }}>
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            Select a customer to start the conversation.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === "agent" ? "justify-start" : "justify-end"}`}
          >
            {m.role === "agent" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "agent"
                  ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                  : "bg-slate-900 text-white rounded-tr-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className={`mt-1 text-[10px] ${m.role === "agent" ? "text-slate-400" : "text-slate-300"}`}>
                {m.time}
              </p>
            </div>
            {m.role === "customer" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled}
            placeholder={disabled ? "Select a customer to begin…" : "Type a customer message…"}
            rows={1}
            className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}