"use client";

import { VideoPanel } from "@/components/VideoPanel";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Controls } from "@/components/Controls";
import { WaitingRoom } from "@/components/WaitingRoom";
import { useVideoChat } from "@/hooks/useVideoChat";
import { Video } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">RandomChat</h1>
              <p className="text-xs text-zinc-400">Talk to strangers safely</p>
            </div>
          </div>
          <StatusBadge state={appState} />
        </div>
      </header>

      {/* Status banner */}
      {waiting && (
        <div className="bg-violet-600/20 px-4 py-2 text-center text-sm text-violet-200">
          Waiting for a stranger...
        </div>
      )}
      {connectionError && (
        <div className="bg-red-600/20 px-4 py-2 text-center text-sm text-red-200">
          {connectionError}
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 lg:flex-row">
        {/* Video area */}
        <div className="flex flex-1 flex-col gap-4">
          {waiting ? (
            <div className="aspect-video w-full lg:min-h-[480px]">
              <WaitingRoom />
            </div>
          ) : (
            <div className="relative aspect-video w-full lg:min-h-[480px]">
              {/* Remote video (main) */}
              <VideoPanel
                stream={remoteStream}
                label="Stranger"
                placeholder={
                  inCall ? "Connecting video..." : "Press Match to start"
                }
                className="h-full w-full"
              />

              {/* Local video (PiP) */}
              <div className="absolute bottom-4 right-4 h-32 w-44 sm:h-36 sm:w-52">
                <VideoPanel
                  stream={localStream}
                  label="You"
                  mirrored
                  placeholder="Your camera"
                  className="h-full w-full shadow-2xl"
                />
              </div>
            </div>
          )}

          {/* Controls */}
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

        {/* Chat sidebar */}
        <div className="h-80 w-full shrink-0 lg:h-auto lg:w-80">
          <ChatSidebar
            messages={messages}
            onSend={sendChat}
            disabled={!chatEnabled}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-zinc-500">
        Be respectful. You must be 18+ to use this service.
      </footer>
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    idle: { text: "Ready", color: "bg-zinc-700 text-zinc-300" },
    waiting: { text: "Searching", color: "bg-amber-600/30 text-amber-300" },
    matched: { text: "Matched", color: "bg-violet-600/30 text-violet-300" },
    "in-call": { text: "In Call", color: "bg-green-600/30 text-green-300" },
  };

  const { text, color } = labels[state] ?? labels.idle;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}
