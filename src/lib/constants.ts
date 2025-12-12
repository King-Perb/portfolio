
import { LayoutDashboard, FolderKanban, Layers, User, Github, Linkedin, Twitter, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const USER_PROFILE = {
    name: "Miko", // Placeholder from screenshot, user can update
    handle: "@King-Perb",
    bio: "Developer & AI builder exploring the future of human-computer interaction",
    avatarUrl: "/portfolio-logo-small.png",
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
    {
        label: "AI Miko",
        href: "/ai-miko",
        icon: Bot,
    },
];

export interface SocialLink {
    platform: string;
    url: string;
    icon: LucideIcon;
}

export const CONTACT_INFO = {
    email: "mikolajlech@gmail.com",
    socialLinks: [
        {
            platform: "GitHub",
            url: "https://github.com/King-Perb",
            icon: Github,
        },
        {
            platform: "LinkedIn",
            url: "https://linkedin.com/in/mikolajlech",
            icon: Linkedin,
        },
        {
            platform: "Twitter",
            url: "https://twitter.com/suiperb",
            icon: Twitter,
        },
    ] as SocialLink[],
};

// Animation preferences
export const ENABLE_PROJECT_IMAGE_ZOOM = true; // Set to false to disable image zoom on hover
