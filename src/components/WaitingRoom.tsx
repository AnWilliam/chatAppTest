"use client";

import { Loader2, Users } from "lucide-react";

export function WaitingRoom() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 ring-1 ring-slate-200 shadow-sm">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
          <Users className="h-12 w-12 text-sky-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Waiting for a stranger...
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          We&apos;re finding someone random to chat with. This usually takes just
          a few seconds.
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-sky-500"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
