import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";
import type { IncomingMessage } from "http";

const PORT = parseInt(process.env.SIGNALING_PORT || "3001", 10);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

type ClientState = "idle" | "waiting" | "matched";

interface Client {
  id: string;
  ws: WebSocket;
  state: ClientState;
  partnerId: string | null;
}

interface SignalMessage {
  type: string;
  [key: string]: unknown;
}

const clients = new Map<string, Client>();
const waitingQueue: string[] = [];

function send(ws: WebSocket, message: SignalMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendToClient(clientId: string, message: SignalMessage) {
  const client = clients.get(clientId);
  if (client) {
    send(client.ws, message);
  }
}

function removeFromQueue(clientId: string) {
  const index = waitingQueue.indexOf(clientId);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
}

function pairClients(clientAId: string, clientBId: string) {
  const clientA = clients.get(clientAId);
  const clientB = clients.get(clientBId);

  if (!clientA || !clientB) return;

  clientA.state = "matched";
  clientB.state = "matched";
  clientA.partnerId = clientBId;
  clientB.partnerId = clientAId;

  removeFromQueue(clientAId);
  removeFromQueue(clientBId);

  send(clientA.ws, { type: "matched", partnerId: clientBId, isInitiator: true });
  send(clientB.ws, { type: "matched", partnerId: clientAId, isInitiator: false });
}

function tryMatch() {
  while (waitingQueue.length >= 2) {
    const clientAId = waitingQueue.shift()!;
    const clientBId = waitingQueue.shift()!;

    const clientA = clients.get(clientAId);
    const clientB = clients.get(clientBId);

    if (!clientA || clientA.state !== "waiting") continue;
    if (!clientB || clientB.state !== "waiting") {
      if (clientB && clientB.state === "waiting") {
        waitingQueue.unshift(clientBId);
      }
      continue;
    }

    pairClients(clientAId, clientBId);
  }
}

function addToQueue(clientId: string) {
  const client = clients.get(clientId);
  if (!client) return;

  client.state = "waiting";
  client.partnerId = null;

  if (!waitingQueue.includes(clientId)) {
    waitingQueue.push(clientId);
  }

  send(client.ws, { type: "waiting" });
  tryMatch();
}

function disconnectPartner(clientId: string) {
  const client = clients.get(clientId);
  if (!client?.partnerId) return;

  const partnerId = client.partnerId;
  const partner = clients.get(partnerId);

  client.partnerId = null;
  client.state = "idle";

  if (partner) {
    partner.partnerId = null;
    partner.state = "idle";
    send(partner.ws, { type: "partner-disconnected" });
  }
}

function handleMessage(clientId: string, raw: string) {
  let message: SignalMessage;
  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }

  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case "find-match":
      addToQueue(clientId);
      break;

    case "next":
      disconnectPartner(clientId);
      addToQueue(clientId);
      break;

    case "cancel-wait":
      removeFromQueue(clientId);
      client.state = "idle";
      send(client.ws, { type: "idle" });
      break;

    case "offer":
    case "answer":
    case "ice-candidate":
    case "chat":
      if (client.partnerId) {
        sendToClient(client.partnerId, { ...message, from: clientId });
      }
      break;

    default:
      break;
  }
}

function handleDisconnect(clientId: string) {
  removeFromQueue(clientId);
  disconnectPartner(clientId);
  clients.delete(clientId);
}

const httpServer = createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        clients: clients.size,
        waiting: waitingQueue.length,
      })
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: FRONTEND_ORIGIN
    ? ({ req }, cb) => {
        const origin = req.headers.origin;
        cb(origin === FRONTEND_ORIGIN || !origin);
      }
    : undefined,
});

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const clientId = uuidv4();
  const client: Client = {
    id: clientId,
    ws,
    state: "idle",
    partnerId: null,
  };
  clients.set(clientId, client);

  send(ws, { type: "connected", clientId });

  ws.on("message", (data) => {
    handleMessage(clientId, data.toString());
  });

  ws.on("close", () => {
    handleDisconnect(clientId);
  });

  ws.on("error", () => {
    handleDisconnect(clientId);
  });

  console.log(`Client connected: ${clientId} (${req.socket.remoteAddress})`);
});
