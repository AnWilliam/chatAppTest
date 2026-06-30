"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, ChatMessage, SignalMessage } from "@/lib/types";
import { ICE_SERVERS, getSignalingUrl } from "@/lib/types";

export function useVideoChat() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isInitiatorRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  const sendSignal = useCallback((message: SignalMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const addMessage = useCallback((text: string, from: "self" | "stranger") => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        from,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const createPeerConnection = useCallback(() => {
    cleanupPeerConnection();

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      const [remote] = event.streams;
      if (remote) {
        setRemoteStream(remote);
        setAppState("in-call");
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setConnectionError("Connection lost. Press Next to find someone new.");
      }
    };

    return pc;
  }, [cleanupPeerConnection, sendSignal]);

  const startCall = useCallback(async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", sdp: offer });
    } catch {
      setConnectionError("Failed to start video call.");
    }
  }, [createPeerConnection, sendSignal]);

  const handleSignalMessage = useCallback(
    async (message: SignalMessage) => {
      switch (message.type) {
        case "connected":
          setConnectionError(null);
          break;

        case "idle":
          setAppState("idle");
          cleanupPeerConnection();
          break;

        case "waiting":
          setAppState("waiting");
          setConnectionError(null);
          cleanupPeerConnection();
          setMessages([]);
          break;

        case "matched":
          setAppState("matched");
          setConnectionError(null);
          setMessages([]);
          isInitiatorRef.current = message.isInitiator;
          if (message.isInitiator) {
            await startCall();
          } else {
            createPeerConnection();
          }
          break;

        case "partner-disconnected":
          cleanupPeerConnection();
          setAppState("idle");
          setConnectionError("Stranger disconnected.");
          break;

        case "offer":
          if (!message.sdp) break;
          {
            const pc = pcRef.current ?? createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal({ type: "answer", sdp: answer });
          }
          break;

        case "answer":
          if (!message.sdp || !pcRef.current) break;
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(message.sdp)
          );
          break;

        case "ice-candidate":
          if (!message.candidate || !pcRef.current) break;
          try {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(message.candidate)
            );
          } catch {
            // Ignore stale candidates
          }
          break;

        case "chat":
          if (message.text) {
            addMessage(message.text, "stranger");
          }
          break;
      }
    },
    [addMessage, cleanupPeerConnection, createPeerConnection, sendSignal, startCall]
  );

  const connectWebSocket = useCallback(() => {
    const current = wsRef.current;
    if (
      current &&
      (current.readyState === WebSocket.OPEN ||
        current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(getSignalingUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SignalMessage;
        handleSignalMessage(message);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      setConnectionError("Cannot reach signaling server. Is it running?");
    };
  }, [handleSignalMessage]);

  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionError(null);
      return true;
    } catch {
      setConnectionError("Camera and microphone access is required.");
      return false;
    }
  }, []);

  const ensureConnected = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const existing = wsRef.current;
      if (existing?.readyState === WebSocket.OPEN) {
        resolve(existing);
        return;
      }

      connectWebSocket();
      const ws = wsRef.current;
      if (!ws) {
        reject(new Error("WebSocket unavailable"));
        return;
      }

      if (ws.readyState === WebSocket.OPEN) {
        resolve(ws);
        return;
      }

      const onOpen = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        resolve(ws);
      };
      const onError = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        reject(new Error("WebSocket connection failed"));
      };
      ws.addEventListener("open", onOpen);
      ws.addEventListener("error", onError);
    });
  }, [connectWebSocket]);

  const findMatch = useCallback(async () => {
    const ok = localStreamRef.current ? true : await initMedia();
    if (!ok) return;
    try {
      await ensureConnected();
      sendSignal({ type: "find-match" });
    } catch {
      setConnectionError("Cannot reach signaling server. Is it running?");
    }
  }, [ensureConnected, initMedia, sendSignal]);

  const nextPartner = useCallback(() => {
    cleanupPeerConnection();
    setMessages([]);
    sendSignal({ type: "next" });
  }, [cleanupPeerConnection, sendSignal]);

  const cancelWait = useCallback(() => {
    sendSignal({ type: "cancel-wait" });
    setAppState("idle");
  }, [sendSignal]);

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      addMessage(trimmed, "self");
      sendSignal({ type: "chat", text: trimmed });
    },
    [addMessage, sendSignal]
  );

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
      cleanupPeerConnection();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [connectWebSocket, cleanupPeerConnection]);

  return {
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
  };
}
