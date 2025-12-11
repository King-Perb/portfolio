"use client"

import { useState, useEffect, useRef, startTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { USER_PROFILE, NAV_ITEMS } from "@/lib/constants";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'moving-right' | 'moving-back'>('idle');
    const [mounted, setMounted] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const [isInitialMount, setIsInitialMount] = useState(true);
    const previousPathnameRef = useRef(pathname);
    const animationStartTimeRef = useRef<number | null>(null);

    // Only render portal after client-side hydration to avoid hydration mismatch
    // This is a valid pattern for client-only rendering in Next.js
    useEffect(() => {
        startTransition(() => {
            setMounted(true);
        });
        // Mark initial mount as complete after a short delay to prevent animation on first load
        const timer = setTimeout(() => {
            startTransition(() => {
                setIsInitialMount(false);
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Watch for pathname changes to detect when content is loaded
    useEffect(() => {
        // If we have a pending route and pathname has changed to match it, content is loaded
        if (pendingRoute && pathname === pendingRoute && pathname !== previousPathnameRef.current && animationStartTimeRef.current) {
            // Calculate how much time has passed since animation started
            // We need to ensure the line reaches the right edge (500ms) before returning
            const timeSinceStart = Date.now() - animationStartTimeRef.current;
            const timeUntilRightEdge = Math.max(0, 500 - timeSinceStart); // Time remaining to reach right edge
            
            // Wait until line reaches right edge, then wait a bit for content to render
            setTimeout(() => {
                setAnimationPhase('moving-back');
                setPendingRoute(null);
                animationStartTimeRef.current = null;
            }, timeUntilRightEdge + 50); // Wait for line to reach edge + small delay for DOM update
            
            // Reset to idle after animation completes
            setTimeout(() => {
                setAnimationPhase('idle');
            }, timeUntilRightEdge + 550); // Wait for line to reach edge + 50ms delay + 500ms return animation
        }
        previousPathnameRef.current = pathname;
    }, [pathname, pendingRoute]);

    const handleNavigation = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
        // Only animate if navigating to a different route
        if (pathname === href) {
            onClose?.();
            return;
        }

        // Prevent default navigation
        e.preventDefault();

        // Start moving right
        setAnimationPhase('moving-right');
        animationStartTimeRef.current = Date.now(); // Track when animation started
        
        // Set pending route to track when content loads
        setPendingRoute(href);
        
        // Navigate after animation completes (500ms for moving-right)
        setTimeout(() => {
            router.push(href);
        }, 500);
    };

    const handleTestClick = () => {
        // Navigate to a different route (cycle through routes for testing)
        const routes = ['/', '/projects', '/stack', '/contact'];
        const currentIndex = routes.indexOf(pathname);
        const nextRoute = routes[(currentIndex + 1) % routes.length] || '/projects';
        
        // Create a synthetic event for handleNavigation
        const syntheticEvent = {
            preventDefault: () => {},
        } as React.MouseEvent<HTMLAnchorElement>;
        
        handleNavigation(nextRoute, syntheticEvent);
    };

    // Render the animated line in a portal to document.body to escape stacking contexts
    // Only render after client-side hydration to avoid hydration mismatch
    const animatedLine = mounted && typeof window !== 'undefined' ? createPortal(
        <motion.div
            className="fixed top-0 h-screen w-0.5 bg-primary border-r-2 border-primary"
            style={{
                left: '280px', // Aligned with sidebar right edge
                zIndex: 99999, // Very high z-index
                pointerEvents: 'none', // Don't block interactions
            }}
            animate={{
                x: animationPhase === 'moving-right' 
                    ? 'calc(100vw - 280px)' // Move to right edge of viewport
                    : animationPhase === 'moving-back'
                    ? 0 // Move back to sidebar edge
                    : 0, // Idle position at sidebar edge
            }}
            transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
            }}
        />,
        document.body
    ) : null;

    const sidebarContent = (
        <>
            {/* Vertical line aligned with navbar edge that moves left to right and back */}
            {animatedLine}
            <aside 
                className={cn("relative flex h-full flex-col gap-6 p-6 border-r border-primary/20 shadow-[2px_0_12px] shadow-primary/10 bg-background", className)}
                style={{
                    width: '100vw', // Container spans full viewport width for reveal effect
                }}
            >
                {/* Content wrapper constrained to 250px - buttons and description stay at 250px */}
                <div className="w-[250px] flex flex-col gap-6 h-full">
                    {/* Player Card Header */}
                    <div className="flex flex-col gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                        <AvatarFallback className="text-lg font-bold">SB</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight">{USER_PROFILE.name}</h2>
                        <p className="text-sm text-muted-foreground font-mono">{USER_PROFILE.handle}</p>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {USER_PROFILE.bio}
                    </p>

                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit border border-primary/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {USER_PROFILE.status}
                    </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-1">
                    {/* Test button that doesn't navigate */}
                    <Button
                        variant="ghost"
                        onClick={handleTestClick}
                        className="w-full justify-start gap-3 h-10 font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                        <span className="h-4 w-4">🧪</span>
                        Test Animation
                    </Button>

                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                onClick={(e) => handleNavigation(item.href, e)}
                            >
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 font-normal",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary rounded-none rounded-r-md"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                    </nav>

                    {/* Footer / Socials (Optional) */}
                    <div className="mt-auto">
                        <p className="text-xs text-muted-foreground text-center">
                            © 2025 {USER_PROFILE.name.split(" ")[0]}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );

    // Render the animated navbar wrapper in a portal to ensure it's above all content
    const navbarWrapper = mounted && typeof window !== 'undefined' ? createPortal(
        <motion.div 
            className="fixed left-0 top-0 h-screen overflow-hidden bg-background"
            style={{
                zIndex: 99999, // Very high z-index to ensure it's above everything
            }}
            initial={{
                width: '280px', // Start at sidebar width to prevent animation on first load
            }}
            animate={{
                // Animate width to reveal navbar as border moves
                // Border at 280px (idle) -> show 280px
                // Border at 100vw (moving-right) -> show 100vw
                // During moving-back, shrink navbar in sync with line returning
                width: animationPhase === 'moving-right'
                    ? '100vw' // Show full width when border reaches right edge
                    : animationPhase === 'moving-back'
                    ? '280px' // Shrink back to sidebar width as line returns
                    : '280px', // Show only sidebar width when idle
            }}
            transition={{
                duration: isInitialMount ? 0 : 0.5, // No transition on initial mount
                ease: [0.4, 0, 0.2, 1],
            }}
        >
            {sidebarContent}
        </motion.div>,
        document.body
    ) : null;

    return (
        <>
            {navbarWrapper}
            {/* Static sidebar for SSR - will be hidden by portal on client */}
            {!mounted && (
                <aside className={cn("relative flex h-full flex-col gap-6 p-6 border-r border-primary/20 shadow-[2px_0_12px] shadow-primary/10 bg-background w-[280px]", className)}>
                    <div className="w-[250px] flex flex-col gap-6 h-full">
                        {/* Player Card Header */}
                        <div className="flex flex-col gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
                            <AvatarFallback className="text-lg font-bold">SB</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">{USER_PROFILE.name}</h2>
                            <p className="text-sm text-muted-foreground font-mono">{USER_PROFILE.handle}</p>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {USER_PROFILE.bio}
                        </p>

                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit border border-primary/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            {USER_PROFILE.status}
                        </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* Navigation */}
                        <nav className="flex flex-col gap-2 flex-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    onClick={(e) => handleNavigation(item.href, e)}
                                >
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-3 h-10 font-normal",
                                            isActive
                                                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary rounded-none rounded-r-md"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                        </nav>

                        {/* Footer / Socials (Optional) */}
                        <div className="mt-auto">
                            <p className="text-xs text-muted-foreground text-center">
                                © 2025 {USER_PROFILE.name.split(" ")[0]}
                            </p>
                        </div>
                    </div>
                </aside>
            )}
        </>
    );
}
