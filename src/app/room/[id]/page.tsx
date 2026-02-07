'use client';

import { useSearchParams } from 'next/navigation';
import HostStage from '@/components/active-room/HostStage';
import ReceiverStage from '@/components/active-room/ReceiverStage';

interface RoomPageProps {
    params: {
        id: string;
    };
}

export default function RoomPage({ params }: RoomPageProps) {
    const searchParams = useSearchParams();
    const isHost = searchParams.get('host') === 'true';
    const roomId = params.id;

    if (isHost) {
        return <HostStage roomId={roomId} />;
    }

    return <ReceiverStage roomId={roomId} />;
}
