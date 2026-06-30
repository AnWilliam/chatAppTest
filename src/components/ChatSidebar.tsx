"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import clsx from "clsx";

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatSidebar({ messages, onSend, disabled }: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <aside className="flex h-full w-full flex-col rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Chat</h2>
        <p className="text-xs text-slate-500">Messages with your match</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">
            Say hello once you&apos;re matched!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex",
                msg.from === "self" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  msg.from === "self"
                    ? "rounded-br-md bg-sky-600 text-white"
                    : "rounded-bl-md bg-slate-100 text-slate-800"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Match first to chat..." : "Type a message..."}
            disabled={disabled}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="flex items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
