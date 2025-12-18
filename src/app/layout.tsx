import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { Shell } from "@/components/layout/shell"
import { AppLoadingScreen } from "@/components/layout/app-loading-screen"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "Miko Software",
  description: "Developer & AI builder exploring the future of human-computer interaction",
  openGraph: {
    title: "Miko Software",
    description: "Developer & AI builder exploring the future of human-computer interaction",
    images: [
      {
        url: "/screenshots/miko-ai-desktop-wide.png",
        width: 1200,
        height: 630,
        alt: "Miko Software - AI Chat Interface",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miko Software",
    description: "Developer & AI builder exploring the future of human-computer interaction",
    images: ["/screenshots/miko-ai-desktop-wide.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppLoadingScreen />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Shell>
            {children}
          </Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
