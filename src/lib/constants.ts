
import { LayoutDashboard, FolderKanban, Layers, User, Github, Linkedin, Twitter } from "lucide-react";
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
