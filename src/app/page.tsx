'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function LandingPage() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const handleStartHosting = () => {
        const roomId = uuidv4().slice(0, 8); // Short 8-char code for easier sharing
        router.push(`/room/${roomId}?host=true`);
    };

    const handleJoinRoom = () => {
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        setError('');
        router.push(`/room/${roomCode.trim()}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    Placechet
                </h1>
                <p className="text-[#71717a] text-lg max-w-md">
                    Share your screen instantly. No sign-up required.
                </p>
            </div>

            {/* Action Cards */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                {/* Host Card */}
                <div className="flex-1 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 hover:border-indigo-500/50 transition-colors">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Share Your Screen</h2>
                        <p className="text-[#71717a] text-sm mb-6">
                            Start broadcasting and get a code to share
                        </p>
                        <button
                            onClick={handleStartHosting}
                            className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Start Hosting
                        </button>
                    </div>
                </div>

                {/* Join Card */}
                <div className="flex-1 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Join a Room</h2>
                        <p className="text-[#71717a] text-sm mb-4">
                            Enter the code shared by the host
                        </p>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => {
                                setRoomCode(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                            placeholder="Enter room code"
                            className="w-full py-3 px-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl mb-3 focus:outline-none focus:border-purple-500 transition-colors text-center text-lg tracking-wider"
                        />
                        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
                        <button
                            onClick={handleJoinRoom}
                            className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-12 text-[#71717a] text-sm">
                No audio or camera access required
            </p>
        </div>
    );
}
