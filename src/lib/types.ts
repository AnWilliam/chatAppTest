export type AppState = "idle" | "waiting" | "matched" | "in-call";

export interface ChatMessage {
  id: string;
  text: string;
  from: "self" | "stranger";
  timestamp: number;
}

export type SignalMessage =
  | { type: "connected"; clientId: string }
  | { type: "idle" }
  | { type: "waiting" }
  | { type: "matched"; partnerId: string; isInitiator: boolean }
  | { type: "partner-disconnected" }
  | { type: "offer"; sdp: RTCSessionDescriptionInit; from?: string }
  | { type: "answer"; sdp: RTCSessionDescriptionInit; from?: string }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit; from?: string }
  | { type: "chat"; text: string; from?: string };

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function getSignalingUrl(): string {
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_SIGNALING_URL;
    if (host?.startsWith("ws")) return host;
    if (host) return `${protocol}//${host.replace(/^https?:\/\//, "")}`;
  }
  return process.env.NEXT_PUBLIC_SIGNALING_URL || "ws://localhost:3001";
}
