'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';

interface ReceiverStageProps {
    roomId: string;
}

export default function ReceiverStage({ roomId }: ReceiverStageProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');

    const { isConnected, peerConnected, remoteStream, messages, sendMessage, error } = useWebRTC({
        roomId,
        isHost: false,
    });

    // Set video source when stream is available
    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Video Section - 80% */}
            <div className="w-[80%] h-screen bg-black relative">
                {remoteStream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            {!isConnected ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[#71717a]">Connecting to server...</p>
                                </>
                            ) : !peerConnected ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[#71717a]">Waiting for host to share screen...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[#71717a]">Receiving stream...</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Overlay */}
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white rounded-xl p-4">
                        {error}
                    </div>
                )}

                {/* Status Bar */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                    <span className="text-sm text-white/80">
                        {peerConnected ? 'Live' : 'Connecting...'}
                    </span>
                </div>
            </div>

            {/* Chat Section - 20% */}
            <div className="w-[20%] h-screen bg-[#141414] border-l border-[#2a2a2a] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[#2a2a2a]">
                    <h2 className="font-semibold">Chat</h2>
                    <p className="text-xs text-[#71717a]">Room: {roomId}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-[#71717a] text-sm mt-8">
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Send a message to the host</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'receiver' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.sender === 'receiver'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-[#2a2a2a] text-white'
                                        }`}
                                >
                                    <p className="break-words">{msg.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-[#2a2a2a]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message..."
                            className="flex-1 py-2 px-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
