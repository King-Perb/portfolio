"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Check, Send } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";
import { SocialLinkComponent } from "@/components/contact/social-link";
import { MobileNextSectionButton } from "@/components/navigation/mobile-next-section-button";
import { useState } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 fade-in-bottom md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Get In Touch</h1>
          <p className="text-muted-foreground mt-1">
            Let&apos;s connect and build something amazing together
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Card */}
        <Card className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground font-mono break-all">
              {CONTACT_INFO.email}
            </p>
            <Button
              onClick={copyEmail}
              variant="outline"
              className="w-full gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Email
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
            >
              <a href={`mailto:${CONTACT_INFO.email}`}>
                <Send className="h-4 w-4" />
                Send Email
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTACT_INFO.socialLinks.map((link) => (
                <SocialLinkComponent key={link.platform} link={link} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNextSectionButton />
    </div>
  );
}
