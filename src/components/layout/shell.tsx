"use client"

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

interface ShellProps {
    children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background">
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="font-bold font-mono tracking-tighter text-lg">
                    MIKO&apos;S PORTFOLIO
                </div>
                <MobileNav />
            </div>

            {/* Desktop Sidebar (Hidden on mobile) */}
            <div className="hidden md:flex flex-col h-screen sticky top-0">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
