import { ChatContainer } from "@/components/ai-miko/chat-container";
import { MobileNextSectionButton } from "@/components/navigation/mobile-next-section-button";

export default function AIMikoPage() {
  return (
    <div className="flex flex-col gap-8 fade-in-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Miko</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Chat with AI Miko. Ask questions about projects, tech stack, or anything else!
          </p>
        </div>
      </div>

      <ChatContainer />

      <MobileNextSectionButton />
    </div>
  );
}
