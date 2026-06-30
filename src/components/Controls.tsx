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
          className="flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500"
        >
          <Play className="h-4 w-4 fill-current" />
          Match
        </button>
      )}

      {waiting && (
        <button
          onClick={onCancelWait}
          className="flex items-center gap-2 rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
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
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
            className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
          >
            <SkipForward className="h-4 w-4" />
            Next
          </button>
        </>
      )}
    </div>
  );
}
