'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useNotification } from '@/hooks/useNotification';

interface HostStageProps {
    roomId: string;
}

export default function HostStage({ roomId }: HostStageProps) {
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { permission, requestPermission, sendNotification } = useNotification();

    const { isConnected, peerConnected, messages, sendMessage, error } = useWebRTC({
        roomId,
        isHost: true,
        onChatMessage: (msg) => {
            // Notify host when receiver sends a message
            if (msg.sender === 'receiver') {
                sendNotification('New Message', msg.message);
            }
        },
    });

    // Request notification permission on mount
    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCopyCode = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Broadcasting</h1>
                    <p className="text-[#71717a] text-sm">
                        {peerConnected ? 'Viewer connected' : 'Waiting for viewer...'}
                    </p>
                </div>

                {/* Room Code */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-[#71717a] mb-1">Room Code</p>
                        <p className="text-lg font-mono font-bold tracking-wider">{roomId}</p>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="p-3 bg-[#141414] border border-[#2a2a2a] rounded-xl hover:border-indigo-500/50 transition-colors"
                        title="Copy room code"
                    >
                        {copied ? (
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Connection Status */}
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                        <div>
                            <p className="text-sm text-[#71717a]">Server</p>
                            <p className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</p>
                        </div>
                    </div>
                </div>

                {/* Viewer Status */}
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${peerConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                        <div>
                            <p className="text-sm text-[#71717a]">Viewer</p>
                            <p className="font-medium">{peerConnected ? 'Watching' : 'Waiting'}</p>
                        </div>
                    </div>
                </div>

                {/* Notification Status */}
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${permission === 'granted' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        <div>
                            <p className="text-sm text-[#71717a]">Notifications</p>
                            <p className="font-medium capitalize">{permission}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
                    {error}
                </div>
            )}

            {/* Broadcasting Indicator */}
            <div className="flex-1 flex items-center justify-center bg-[#141414] border border-[#2a2a2a] rounded-2xl mb-6">
                <div className="text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/40 flex items-center justify-center animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-indigo-500" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Screen is being shared</h2>
                    <p className="text-[#71717a]">Your viewer can see your screen now</p>
                </div>
            </div>

            {/* Chat Section */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#2a2a2a]">
                    <h3 className="font-semibold">Chat</h3>
                </div>

                {/* Messages */}
                <div className="h-48 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-[#71717a] text-center text-sm">No messages yet</p>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'host' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sender === 'host'
                                        ? 'bg-indigo-500 text-white'
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
                <form onSubmit={handleSubmit} className="p-4 border-t border-[#2a2a2a] flex gap-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 py-2 px-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
