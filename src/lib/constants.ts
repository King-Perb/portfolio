
import { LayoutDashboard, FolderKanban, Layers, User } from "lucide-react";

export const USER_PROFILE = {
    name: "Siddharth Bharath", // Placeholder from screenshot, user can update
    handle: "@siddharthb",
    bio: "Developer & AI builder exploring the future of human-computer interaction",
    avatarUrl: "https://github.com/shadcn.png", // Fallback
    status: "Building in public",
};

export const NAV_ITEMS = [
    {
        label: "Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
    },
    {
        label: "Stack",
        href: "/stack",
        icon: Layers,
    },
    {
        label: "Contact",
        href: "/contact",
        icon: User,
    },
];
