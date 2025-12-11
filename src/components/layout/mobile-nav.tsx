"use client"

import { useState, useEffect, startTransition } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ANIMATION_CONFIG, ANIMATION_PHASE, SIDEBAR_CONFIG } from "@/components/layout/sidebar/constants";
import type { AnimationPhase } from "@/components/layout/sidebar/constants";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(ANIMATION_PHASE.IDLE);
    const [isInitialMount, setIsInitialMount] = useState(true);

    // Track initial mount to prevent animation on first open (EXACTLY THE SAME AS AnimatedWrapper)
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                startTransition(() => {
                    setIsInitialMount(false);
                });
            }, ANIMATION_CONFIG.INITIAL_MOUNT_DELAY);
            return () => clearTimeout(timer);
        } else {
            startTransition(() => {
                setIsInitialMount(true);
                setAnimationPhase(ANIMATION_PHASE.IDLE); // Reset on close
            });
        }
    }, [open]);

    // Animate SheetContent width directly (since it's portaled, wrapper doesn't constrain it)
    useEffect(() => {
        if (!open) return;

        // Calculate width based on animation phase (EXACTLY THE SAME AS AnimatedWrapper)
        const getWidth = () => {
            if (animationPhase === ANIMATION_PHASE.MOVING_RIGHT) {
                return "100vw"; // Show full width when border reaches right edge
            } else if (animationPhase === ANIMATION_PHASE.MOVING_BACK) {
                return `${SIDEBAR_CONFIG.WIDTH}px`; // Shrink back to sidebar width as line returns
            } else {
                return `${SIDEBAR_CONFIG.WIDTH}px`; // Show only sidebar width when idle
            }
        };

        const updateWidth = () => {
            const sheetContent = document.querySelector('[data-slot="sheet-content"]') as HTMLElement;
            if (sheetContent) {
                const width = getWidth();
                sheetContent.style.width = width;
                sheetContent.style.maxWidth = 'none';
                sheetContent.style.transition = isInitialMount
                    ? 'none'
                    : `width ${ANIMATION_CONFIG.DURATION / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`;
            }
        };

        // Small delay to ensure SheetContent is rendered (portal renders async)
        const timer = setTimeout(updateWidth, 10);
        updateWidth(); // Also try immediately

        return () => clearTimeout(timer);
    }, [open, animationPhase, isInitialMount]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="p-0 overflow-visible"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Reuse the Sidebar component inside the sheet */}
                <Sidebar
                    className="w-full border-none"
                    onClose={() => setOpen(false)}
                    onAnimationPhaseChange={setAnimationPhase}
                />
            </SheetContent>
        </Sheet>
    );
}
