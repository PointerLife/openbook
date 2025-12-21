'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { SIDEBAR_STATE_KEY } from '@/lib/storageKeys';

const SIDEBAR_WIDTH = 256;

export default function SidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Initialize from localStorage to avoid flash if possible, or default to true
    // We use a function in useState to read from localStorage only once on mount
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
            return savedState !== null ? savedState === 'true' : true;
        } catch {
            return true;
        }
    });

    // Update localStorage when state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
        }
    }, [sidebarOpen]);

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div
                className="flex-1 min-h-screen transition-all duration-300 ease-out flex flex-col"
                style={{ marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
            >
                {children}
            </div>
        </div>
    );
}
