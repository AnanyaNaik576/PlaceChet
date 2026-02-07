'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';

const SIGNALING_SERVER = process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:3001';

interface ChatMessage {
    message: string;
    sender: 'host' | 'receiver';
    timestamp: number;
}

interface UseWebRTCOptions {
    roomId: string;
    isHost: boolean;
    onChatMessage?: (msg: ChatMessage) => void;
}

export function useWebRTC({ roomId, isHost, onChatMessage }: UseWebRTCOptions) {
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<PeerInstance | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [peerConnected, setPeerConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Initialize socket connection
    useEffect(() => {
        const socket = io(SIGNALING_SERVER);
        socketRef.current = socket;

        // Define initializePeer INSIDE useEffect to avoid stale closure
        const initializePeer = async (initiator: boolean, targetId: string) => {
            try {
                let stream: MediaStream | undefined;

                // Only host captures screen
                if (isHost) {
                    console.log('Requesting screen share...');
                    stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false,
                    } as MediaStreamConstraints);
                    localStreamRef.current = stream;
                    console.log('Got screen stream');

                    // Handle stream end (user stops sharing)
                    stream.getVideoTracks()[0].onended = () => {
                        console.log('Screen sharing ended');
                        if (peerRef.current) {
                            peerRef.current.destroy();
                        }
                    };
                }

                const peer = new SimplePeer({
                    initiator,
                    trickle: false,
                    stream,
                });

                peer.on('signal', (signal) => {
                    socket.emit('signal', {
                        roomId,
                        signal,
                        to: targetId,
                    });
                });

                peer.on('connect', () => {
                    console.log('Peer connected!');
                    setPeerConnected(true);
                });

                peer.on('stream', (incomingStream) => {
                    console.log('Received remote stream');
                    setRemoteStream(incomingStream);
                });

                peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    setError(err.message);
                });

                peer.on('close', () => {
                    console.log('Peer connection closed');
                    setPeerConnected(false);
                });

                peerRef.current = peer;
            } catch (err) {
                console.error('Failed to initialize peer:', err);
                setError(err instanceof Error ? err.message : 'Failed to start screen sharing');
            }
        };

        socket.on('connect', () => {
            console.log('Connected to signaling server');
            setIsConnected(true);
            socket.emit('join-room', { roomId, isHost });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('peer-disconnected', () => {
            setPeerConnected(false);
            setRemoteStream(null);
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        });

        // Handle incoming signals
        socket.on('signal', ({ signal, from }: { signal: SimplePeer.SignalData; from: string }) => {
            if (peerRef.current) {
                peerRef.current.signal(signal);
            } else if (!isHost) {
                // Receiver: create peer when receiving first signal
                initializePeer(false, from).then(() => {
                    setTimeout(() => {
                        peerRef.current?.signal(signal);
                    }, 100);
                });
            }
        });

        // Handle chat messages
        socket.on('chat-message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            onChatMessage?.(msg);
        });

        // If host, wait for receiver to join
        if (isHost) {
            socket.on('receiver-joined', ({ receiverId }: { receiverId: string }) => {
                console.log('Receiver joined, starting peer connection');
                initializePeer(true, receiverId);
            });
        }

        return () => {
            socket.disconnect();
            if (peerRef.current) {
                peerRef.current.destroy();
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, isHost]);

    // Send chat message
    const sendMessage = useCallback((message: string) => {
        if (socketRef.current && message.trim()) {
            const sender = isHost ? 'host' : 'receiver';
            const msg: ChatMessage = {
                message: message.trim(),
                sender,
                timestamp: Date.now(),
            };
            socketRef.current.emit('chat-message', { roomId, ...msg });
            setMessages(prev => [...prev, msg]);
        }
    }, [roomId, isHost]);

    return {
        isConnected,
        peerConnected,
        remoteStream,
        localStream: localStreamRef.current,
        error,
        messages,
        sendMessage,
    };
}
