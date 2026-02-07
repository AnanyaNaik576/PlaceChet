import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Placechet - Screen Sharing',
    description: '1-on-1 screen sharing with chat',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">
                {children}
            </body>
        </html>
    );
}
