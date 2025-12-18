import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Lazy-initialize OpenAI client only when needed (not during build)
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], threadId } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      return NextResponse.json(
        { error: "OpenAI Assistant ID not configured" },
        { status: 500 }
      );
    }

    const openai = getOpenAIClient();

    // Helper function to create or reuse thread
    async function getOrCreateThread(
      openai: OpenAI,
      existingThreadId: string | undefined,
      controller: ReadableStreamDefaultController<Uint8Array>,
      encoder: TextEncoder
    ): Promise<string> {
      if (existingThreadId) {
        return existingThreadId;
      }

      const thread = await openai.beta.threads.create();
      const threadData = JSON.stringify({ threadId: thread.id });
      controller.enqueue(encoder.encode(`data: ${threadData}\n\n`));
      return thread.id;
    }

    // Helper function to add conversation history to thread
    async function addConversationHistory(
      openai: OpenAI,
      threadId: string,
      conversationHistory: Array<{ role: string; content: string }>
    ): Promise<void> {
      if (conversationHistory.length === 0) return;

      for (const msg of conversationHistory) {
        await openai.beta.threads.messages.create(threadId, {
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Helper function to extract text value from delta
    function extractTextValue(delta: { type: string; text?: unknown }): string | undefined {
      if (delta.type !== "text" || !delta.text) {
        return undefined;
      }

      if (typeof delta.text === "string") {
        return delta.text;
      }

      if (delta.text && typeof delta.text === "object") {
        const textObj = delta.text as { value?: string; [key: string]: unknown };
        return textObj.value;
      }

      return undefined;
    }

    // Helper function to handle stream events
    async function handleStreamEvents(
      run: AsyncIterable<unknown>,
      controller: ReadableStreamDefaultController<Uint8Array>,
      encoder: TextEncoder
    ): Promise<void> {
      for await (const event of run) {
        const streamEvent = event as {
          event: string;
          data?: { delta?: { content?: Array<{ type: string; text?: unknown }> } };
        };

        if (streamEvent.event === "thread.message.delta") {
          const contentDeltas = streamEvent.data?.delta?.content || [];
          for (const delta of contentDeltas) {
            const textValue = extractTextValue(delta);
            if (textValue && typeof textValue === "string") {
              const data = JSON.stringify({ content: textValue });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
        } else if (streamEvent.event === "thread.run.completed") {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        } else if (streamEvent.event === "thread.run.failed") {
          throw new Error("Assistant run failed");
        }
      }

      // Send completion signal if we didn't already
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const currentThreadId = await getOrCreateThread(
            openai,
            threadId,
            controller,
            encoder
          );

          // Add conversation history to thread if it's a new thread
          if (!threadId) {
            await addConversationHistory(openai, currentThreadId, conversationHistory);
          }

          // Add the new user message to the thread
          await openai.beta.threads.messages.create(currentThreadId, {
            role: "user",
            content: message,
          });

          // Create a run with the assistant
          const run = await openai.beta.threads.runs.create(currentThreadId, {
            assistant_id: assistantId,
            stream: true,
          });

          // Stream the run events
          await handleStreamEvents(run, controller, encoder);
        } catch (error) {
          console.error("OpenAI API error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const errorData = JSON.stringify({
            error: "Failed to get response from OpenAI",
            details: errorMessage
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Miko API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
