import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatMessage } from "@/types/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let currentThreadId = threadId;

          // Create a new thread if we don't have one
          if (!currentThreadId) {
            const thread = await openai.beta.threads.create();
            currentThreadId = thread.id;
            
            // Send thread ID to client so they can reuse it
            const threadData = JSON.stringify({ threadId: currentThreadId });
            controller.enqueue(encoder.encode(`data: ${threadData}\n\n`));
          }

          // Add conversation history to thread if it's a new thread
          // (existing threads already have their history)
          if (!threadId && conversationHistory.length > 0) {
            // Add all previous messages to the thread
            for (const msg of conversationHistory) {
              await openai.beta.threads.messages.create(currentThreadId, {
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
              });
            }
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
          for await (const event of run) {
            if (event.event === "thread.message.delta") {
              const contentDeltas = event.data.delta.content || [];
              for (const delta of contentDeltas) {
                // Check if it's a text delta
                if (delta.type === "text" && delta.text) {
                  // Extract text value - in Assistants API, text is an object with a 'value' property
                  let textValue: string | undefined;
                  
                  if (typeof delta.text === "string") {
                    textValue = delta.text;
                  } else if (delta.text && typeof delta.text === "object") {
                    // Try accessing .value property
                    const textObj = delta.text as { value?: string; [key: string]: unknown };
                    textValue = textObj.value;
                  }
                  
                  if (textValue && typeof textValue === "string") {
                    // Transform to our SSE format
                    const data = JSON.stringify({ content: textValue });
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  }
                }
              }
            } else if (event.event === "thread.run.completed") {
              // Run completed successfully
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            } else if (event.event === "thread.run.failed") {
              throw new Error("Assistant run failed");
            }
          }

          // Send completion signal if we didn't already
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
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
