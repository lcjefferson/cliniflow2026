"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col ml-64">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    );
}
