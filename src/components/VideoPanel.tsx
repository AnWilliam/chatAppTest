"use client";

import { useEffect, useRef } from "react";
import { User } from "lucide-react";
import clsx from "clsx";

interface VideoPanelProps {
  stream: MediaStream | null;
  label: string;
  mirrored?: boolean;
  placeholder?: string;
  className?: string;
}

export function VideoPanel({
  stream,
  label,
  mirrored = false,
  placeholder = "No video",
  className,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10",
        className
      )}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={mirrored}
          className={clsx(
            "h-full w-full object-cover",
            mirrored && "scale-x-[-1]"
          )}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <User className="h-10 w-10" />
          </div>
          <p className="text-sm">{placeholder}</p>
        </div>
      )}
      <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {label}
      </div>
    </div>
  );
}
