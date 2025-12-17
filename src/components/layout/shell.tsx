"use client"

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavigationProvider, useNavigation } from "@/contexts/navigation-context";
import { PageTransitionLine } from "@/components/layout/page-transition-line";

interface ShellProps {
    children: React.ReactNode;
}

function ShellContent({ children }: ShellProps) {
    const { animationPhase } = useNavigation();

    return (
        <div className="flex h-dvh flex-col md:flex-row bg-background overflow-hidden">
            {/* Page Transition Line (for mobile content navigation) */}
            <PageTransitionLine animationPhase={animationPhase} />

            {/* Mobile Top Bar - Fixed at top */}
            <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md z-50 shrink-0">
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
            {/* Add left margin to account for fixed sidebar (280px) and top padding for mobile navbar */}
            <main className="flex-1 min-h-0 overflow-y-auto md:ml-[280px] pt-16 md:pt-0 flex flex-col">
                <div className="container max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 flex flex-col min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
}

export function Shell({ children }: ShellProps) {
    return (
        <NavigationProvider>
            <ShellContent>{children}</ShellContent>
        </NavigationProvider>
    );
}
