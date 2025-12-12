export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[]; // Document sources referenced (for NotebookLM-like feature)
}

export interface ChatDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

