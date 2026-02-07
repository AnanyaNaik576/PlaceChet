# Placechet - 1-on-1 Screen Sharing

A minimal screen sharing tool where a host broadcasts their screen and a receiver views it with a chat sidebar.

## Features

- **Host**: Shares screen (no audio/camera), receives browser notifications for chat messages
- **Receiver**: Views host's screen (80% width) with chat sidebar (20% width)
- **Real-time chat**: Messages from receiver trigger notifications on host side

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the signaling server (Terminal 1):**
   ```bash
   npm run server
   ```

3. **Start Next.js dev server (Terminal 2):**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   - Go to `http://localhost:3000`
   - Click **Start Hosting** → get a room code
   - Share the code with viewer
   - Viewer enters code and clicks **Join Room**

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (dark mode)
- simple-peer (WebRTC)
- Socket.io (signaling)
