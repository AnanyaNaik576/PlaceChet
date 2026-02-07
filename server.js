const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Store room info
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room
    socket.on('join-room', ({ roomId, isHost }) => {
        socket.join(roomId);

        if (isHost) {
            rooms.set(roomId, { hostId: socket.id, receiverId: null });
            console.log(`Host ${socket.id} created room ${roomId}`);
        } else {
            const room = rooms.get(roomId);
            if (room) {
                room.receiverId = socket.id;
                // Notify host that receiver joined
                io.to(room.hostId).emit('receiver-joined', { receiverId: socket.id });
                console.log(`Receiver ${socket.id} joined room ${roomId}`);
            }
        }
    });

    // WebRTC signaling
    socket.on('signal', ({ roomId, signal, to }) => {
        console.log(`Signal from ${socket.id} to ${to}`);
        io.to(to).emit('signal', { signal, from: socket.id });
    });

    // Chat messages
    socket.on('chat-message', ({ roomId, message, sender }) => {
        const room = rooms.get(roomId);
        if (room) {
            // Broadcast to everyone in room except sender
            socket.to(roomId).emit('chat-message', { message, sender, timestamp: Date.now() });
            console.log(`Chat in ${roomId}: ${sender}: ${message}`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Clean up rooms
        rooms.forEach((room, roomId) => {
            if (room.hostId === socket.id || room.receiverId === socket.id) {
                io.to(roomId).emit('peer-disconnected');
                if (room.hostId === socket.id) {
                    rooms.delete(roomId);
                } else {
                    room.receiverId = null;
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Signaling server running on port ${PORT}`);
});
