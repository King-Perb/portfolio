"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { USER_PROFILE, NAV_ITEMS } from "@/lib/constants";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("flex h-full w-[280px] flex-col gap-6 p-6 border-r border-primary/20 shadow-[2px_0_12px] shadow-primary/10", className)}>
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
                        <Link key={item.href} href={item.href}>
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
        </aside>
    );
}
