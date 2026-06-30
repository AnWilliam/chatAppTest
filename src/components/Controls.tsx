"use client";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Play,
  SkipForward,
  X,
} from "lucide-react";
import type { AppState } from "@/lib/types";
import clsx from "clsx";

interface ControlsProps {
  appState: AppState;
  isMuted: boolean;
  isCameraOff: boolean;
  onMatch: () => void;
  onNext: () => void;
  onCancelWait: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function Controls({
  appState,
  isMuted,
  isCameraOff,
  onMatch,
  onNext,
  onCancelWait,
  onToggleMute,
  onToggleCamera,
}: ControlsProps) {
  const inCall = appState === "matched" || appState === "in-call";
  const waiting = appState === "waiting";
  const idle = appState === "idle";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {idle && (
        <button
          onClick={onMatch}
          className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 hover:shadow-violet-500/40"
        >
          <Play className="h-4 w-4 fill-current" />
          Match
        </button>
      )}

      {waiting && (
        <button
          onClick={onCancelWait}
          className="flex items-center gap-2 rounded-full bg-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-600"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      )}

      {inCall && (
        <>
          <button
            onClick={onToggleMute}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full transition",
              isMuted
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            onClick={onToggleCamera}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full transition",
              isCameraOff
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
            title={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? (
              <CameraOff className="h-5 w-5" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            <SkipForward className="h-4 w-4" />
            Next
          </button>
        </>
      )}
    </div>
  );
}
