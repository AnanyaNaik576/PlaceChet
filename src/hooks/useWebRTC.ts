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
    }, [roomId, isHost]);

    // Initialize peer connection
    const initializePeer = useCallback(async (initiator: boolean, targetId: string) => {
        try {
            let stream: MediaStream | undefined;

            // Only host captures screen
            if (isHost) {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                } as DisplayMediaStreamOptions);
                localStreamRef.current = stream;

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
                socketRef.current?.emit('signal', {
                    roomId,
                    signal,
                    to: targetId,
                });
            });

            peer.on('connect', () => {
                console.log('Peer connected!');
                setPeerConnected(true);
            });

            peer.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                setRemoteStream(remoteStream);
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
    }, [roomId, isHost]);

    // For receiver: respond to host's signal
    useEffect(() => {
        if (!isHost && socketRef.current) {
            const socket = socketRef.current;

            const handleSignal = ({ signal, from }: { signal: SimplePeer.SignalData; from: string }) => {
                if (!peerRef.current) {
                    // Create peer as non-initiator when receiving first signal
                    initializePeer(false, from).then(() => {
                        peerRef.current?.signal(signal);
                    });
                }
            };

            socket.on('signal', handleSignal);

            return () => {
                socket.off('signal', handleSignal);
            };
        }
    }, [isHost, initializePeer]);

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
