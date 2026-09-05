<div align="center">

# 🖥️ Placechet

**Instant 1-on-1 Screen Sharing with Real-time Chat**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-white?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-simple--peer-green?style=for-the-badge)](https://github.com/feross/simple-peer)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](https://placechet.vercel.app) · [Report Bug](https://github.com/VISHAL-Nk/placechet/issues) · [Request Feature](https://github.com/VISHAL-Nk/placechet/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 **Screen Sharing** | Host shares their screen instantly - no audio/camera access needed |
| 💬 **Real-time Chat** | Built-in chat sidebar for communication |
| 🔔 **Browser Notifications** | Host gets notified when receiver sends messages (works in background!) |
| 🔗 **Simple Room Codes** | 8-character room codes for easy sharing |
| 🌙 **Dark Mode** | Beautiful dark theme by default |
| ⚡ **No Sign-up** | Just click and share - zero friction |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="120">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
<br><strong>Next.js 14</strong>
<br><sub>App Router</sub>
</td>
<td align="center" width="120">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<br><strong>TypeScript</strong>
<br><sub>Type Safety</sub>
</td>
<td align="center" width="120">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br><strong>Tailwind CSS</strong>
<br><sub>Styling</sub>
</td>
<td align="center" width="120">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" width="48" height="48" alt="Socket.io" />
<br><strong>Socket.io</strong>
<br><sub>Signaling</sub>
</td>
<td align="center" width="120">
<img src="https://webrtc.github.io/webrtc-org/assets/images/webrtc-logo-vert-retro-255x305.png" width="48" height="48" alt="WebRTC" />
<br><strong>WebRTC</strong>
<br><sub>Streaming</sub>
</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│      HOST       │◄───────►│  Signaling Server│◄───────►│    RECEIVER     │
│  (Screen Share) │  WS/Sig │   (Socket.io)    │  WS/Sig │  (View + Chat)  │
│                 │         │                  │         │                 │
└────────┬────────┘         └──────────────────┘         └────────┬────────┘
         │                                                        │
         │              WebRTC Peer Connection                    │
         └────────────────────────────────────────────────────────┘
                         (Direct Video Stream)
```

**Flow:**
1. Host creates room → Gets room code
2. Receiver joins with code → Signaling server notifies host
3. Host shares screen → WebRTC peer connection established
4. Video streams directly between peers (P2P)
5. Chat messages flow through signaling server

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Clone the repo
git clone [(https://github.com/AnanyaNaik576/placechet.git)](https://github.com/AnanyaNaik576/placechet.git)
cd placechet

# Install dependencies
npm install

# Start signaling server (Terminal 1)
node server.js

# Start Next.js dev server (Terminal 2)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## ☁️ Deployment

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VISHAL-Nk/placechet)

**Environment Variable:**
```
NEXT_PUBLIC_SIGNALING_SERVER=https://your-signaling-server.onrender.com
```

### Signaling Server (Render)

1. Create new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Deploy!

---

## 📁 Project Structure

```
placechet/
├── server.js                    # Socket.io signaling server
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── room/[id]/
│   │       └── page.tsx        # Room page (host/receiver detection)
│   ├── components/
│   │   └── active-room/
│   │       ├── HostStage.tsx   # Host UI + notifications
│   │       └── ReceiverStage.tsx # 80% video + 20% chat
│   └── hooks/
│       ├── useWebRTC.ts        # WebRTC + Socket.io logic
│       └── useNotification.ts  # Browser notifications
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 📖 How It Works

### Host Side
1. Click **"Start Hosting"** → Generates room code
2. Share the code with your viewer
3. When viewer joins → Screen share picker appears
4. Select screen/window to share
5. Receive **browser notifications** when viewer sends chat messages

### Receiver Side
1. Enter room code → Click **"Join Room"**
2. See host's screen on **80%** of the viewport
3. Use **chat sidebar (20%)** to communicate with host

---

## 🔔 Notifications

The host receives **system-level browser notifications** when the receiver sends a message. This works even when:
- The browser tab is in the background
- The user is in another application

> **Note:** Browser will ask for notification permission on first use.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ by [Ananya Naik](https://github.com/AnanyaNaik576)**

⭐ Star this repo if you found it useful!

</div>
