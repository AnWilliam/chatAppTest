# RandomChat — Omegle-style Random Video Chat

A modern random video chat web app built with **Next.js**, **WebRTC**, and a **Node.js WebSocket signaling server**.

## Features

- Random matchmaking with other online users
- Video + audio via WebRTC (peer-to-peer media)
- Side chat box for text messages during calls
- **Match** button to join the queue
- **Next** button to skip and find someone new
- Waiting room UI while searching
- Mute / camera toggle controls
- Dark, responsive UI

## Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────────┐
│  Next.js Client │ ◄────────────────────────► │  Signaling Server    │
│  (Browser)      │   match / offer / answer /   │  (Node.js + ws)      │
│                 │   ICE / chat relay           │  NOT on Vercel       │
└────────┬────────┘                              └──────────────────────┘
         │
         │ WebRTC (STUN + peer connection)
         ▼
┌─────────────────┐
│  Remote Browser │  ← direct P2P video/audio
└─────────────────┘
```

| Layer | Technology | Where it runs |
|-------|-----------|---------------|
| Frontend | Next.js 15, React, Tailwind | **Vercel** |
| Signaling | Node.js WebSocket (`ws`) | **External** (Railway, Render, Fly.io, local) |
| Media | WebRTC P2P | Browser ↔ Browser |

> **Why hybrid?** Vercel serverless does not support persistent WebSocket connections. The signaling server must run on a platform that keeps a long-lived process (Railway, Render, Fly.io, a VPS, or locally for development).

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- npm

### 1. Install dependencies

```bash
cd ~/Projects/random-video-chat
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Default values work for local development:

```
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:3001
SIGNALING_PORT=3001
```

### 3. Run frontend + signaling server

```bash
npm run dev
```

This starts:

- **Next.js** at [http://localhost:3000](http://localhost:3000)
- **WebSocket server** at `ws://localhost:3001`

Open two browser tabs (or use two devices on the same network) to test matching.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run Next.js + signaling server together |
| `npm run dev:next` | Next.js only |
| `npm run dev:server` | Signaling server only |
| `npm run build` | Production build (frontend) |
| `npm run start` | Start production Next.js |
| `npm run start:server` | Start production signaling server |

## Deploy to Vercel (Frontend)

### Step 1: Deploy the Next.js app

```bash
npx vercel
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com/new).

### Step 2: Deploy the signaling server elsewhere

Deploy `server/index.ts` to a WebSocket-capable host. Example with **Railway** or **Render**:

```bash
# Build/start command
npm run start:server

# Environment variables
SIGNALING_PORT=3001
FRONTEND_ORIGIN=https://your-app.vercel.app
```

Recommended hosts (free tiers available):

- [Railway](https://railway.app)
- [Render](https://render.com)
- [Fly.io](https://fly.io)

### Step 3: Connect frontend to signaling server

In **Vercel Project Settings → Environment Variables**, set:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SIGNALING_URL` | `wss://your-signaling.railway.app` |

Redeploy after adding env vars.

### Step 4: CORS / origin check

On the signaling server, set:

```
FRONTEND_ORIGIN=https://your-app.vercel.app
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SIGNALING_URL` | Yes | WebSocket URL for the browser (e.g. `ws://localhost:3001` or `wss://...`) |
| `SIGNALING_PORT` | Server only | Port for the signaling server (default `3001`) |
| `FRONTEND_ORIGIN` | Production | Allowed browser origin for WebSocket connections |

## How It Works

1. User clicks **Match** → client requests camera/mic and sends `find-match` over WebSocket.
2. Server adds user to a FIFO queue; when two users are waiting, they are paired.
3. Initiator creates a WebRTC offer; server relays offer/answer/ICE candidates.
4. Once connected, video/audio flows peer-to-peer; chat messages relay through the server.
5. **Next** disconnects the current partner and re-queues the user.

## Limitations

- **Signaling server required**: Cannot run entirely on Vercel serverless.
- **NAT/firewalls**: Some networks block WebRTC; users may need TURN servers for strict NAT (only STUN is configured by default).
- **No persistence**: Chat history is session-only; no accounts or moderation.
- **Scale**: Single-process queue; for production scale, use Redis-backed matchmaking.

## Project Structure

```
random-video-chat/
├── server/
│   └── index.ts          # WebSocket signaling + matchmaking
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UI components
│   ├── hooks/            # useVideoChat hook
│   └── lib/              # Types & config
├── package.json
├── .env.example
└── README.md
```

## License

MIT
