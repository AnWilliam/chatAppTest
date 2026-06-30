"use client";

import { Loader2, Users } from "lucide-react";

export function WaitingRoom() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl bg-zinc-900/80 p-8 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-600/20">
          <Users className="h-12 w-12 text-violet-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">
          Waiting for a stranger...
        </h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          We&apos;re finding someone random to chat with. This usually takes just
          a few seconds.
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-violet-500"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
