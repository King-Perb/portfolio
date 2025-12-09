
import { LayoutDashboard, FolderKanban, Layers, User, Github, Linkedin, Twitter, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

export interface SocialLink {
    platform: string;
    url: string;
    icon: LucideIcon;
}

export const CONTACT_INFO = {
    email: "your-email@example.com", // Update with your email
    socialLinks: [
        {
            platform: "GitHub",
            url: "https://github.com/yourusername", // Update with your GitHub
            icon: Github,
        },
        {
            platform: "LinkedIn",
            url: "https://linkedin.com/in/yourusername", // Update with your LinkedIn
            icon: Linkedin,
        },
        {
            platform: "Twitter",
            url: "https://twitter.com/yourusername", // Update with your Twitter
            icon: Twitter,
        },
    ] as SocialLink[],
};
