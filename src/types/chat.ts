export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SourceDoc {
  page_content: string;
  metadata: Record<string, unknown>;
}

export interface ChatRequest {
  query: string;
  history: Message[];
}

export interface ChatResponse {
  answer: string;
  standalone_query: string;
  variant: string;
  source_docs: SourceDoc[];
}

export interface ChatMessage extends Message {
  id: string;
  timestamp: Date;
  standalone_query?: string;
  variant?: string;
  source_docs?: SourceDoc[];
  isLoading?: boolean;
}
