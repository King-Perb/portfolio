export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[]; // Document sources referenced (for RAG/document-based responses)
}

export interface ChatDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}
