"use client";

import { VideoPanel } from "@/components/VideoPanel";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Controls } from "@/components/Controls";
import { WaitingRoom } from "@/components/WaitingRoom";
import { useVideoChat } from "@/hooks/useVideoChat";
import { Link2 } from "lucide-react";

export function VideoChatApp() {
  const {
    appState,
    localStream,
    remoteStream,
    messages,
    isMuted,
    isCameraOff,
    connectionError,
    findMatch,
    nextPartner,
    cancelWait,
    sendChat,
    toggleMute,
    toggleCamera,
  } = useVideoChat();

  const waiting = appState === "waiting";
  const inCall = appState === "matched" || appState === "in-call";
  const chatEnabled = inCall;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 shadow-sm">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">LinkUp</h1>
              <p className="text-xs text-slate-500">Connect with someone new</p>
            </div>
          </div>
          <StatusBadge state={appState} />
        </div>
      </header>

      {waiting && (
        <div className="bg-sky-50 px-4 py-2 text-center text-sm text-sky-700">
          Waiting for a stranger...
        </div>
      )}
      {connectionError && (
        <div className="bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          {connectionError}
        </div>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          {waiting ? (
            <div className="aspect-video w-full lg:min-h-[480px]">
              <WaitingRoom />
            </div>
          ) : (
            <div className="relative aspect-video w-full lg:min-h-[480px]">
              <VideoPanel
                stream={remoteStream}
                label="Stranger"
                placeholder={
                  inCall ? "Connecting video..." : "Press Match to start"
                }
                className="h-full w-full"
              />

              <div className="absolute bottom-4 right-4 h-32 w-44 sm:h-36 sm:w-52">
                <VideoPanel
                  stream={localStream}
                  label="You"
                  mirrored
                  placeholder="Your camera"
                  className="h-full w-full shadow-xl ring-1 ring-slate-200"
                />
              </div>
            </div>
          )}

          <Controls
            appState={appState}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onMatch={findMatch}
            onNext={nextPartner}
            onCancelWait={cancelWait}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
          />
        </div>

        <div className="h-80 w-full shrink-0 lg:h-auto lg:w-80">
          <ChatSidebar
            messages={messages}
            onSend={sendChat}
            disabled={!chatEnabled}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
        Be respectful. You must be 18+ to use this service.
      </footer>
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    idle: { text: "Ready", color: "bg-slate-100 text-slate-600" },
    waiting: { text: "Searching", color: "bg-amber-100 text-amber-700" },
    matched: { text: "Matched", color: "bg-sky-100 text-sky-700" },
    "in-call": { text: "In Call", color: "bg-emerald-100 text-emerald-700" },
  };

  const { text, color } = labels[state] ?? labels.idle;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}
