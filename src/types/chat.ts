export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[]; // Document sources referenced (for RAG/document-based responses)
  /**
   * Optional metadata indicating that this message originated from a starter prompt
   * bubble in the Miko AI chat. When present, promptId should match one of the
   * IDs in `MIKO_STARTER_PROMPTS`.
   */
  source?: "starter-prompt" | "user" | "assistant";
  promptId?: string;
}

export interface ChatDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}
