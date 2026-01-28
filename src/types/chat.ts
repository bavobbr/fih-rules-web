export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Country {
  code: string;  // ISO 3-letter code (e.g., "BEL")
  name: string;  // Full name (e.g., "Belgium")
}

export interface SourceDocMetadata {
  page?: number;
  source?: string;
  chapter?: string;
  heading?: string;
  section?: string;
  summary?: string;
  variant?: string;
  source_file?: string;
  rule_number?: string;
  [key: string]: unknown;
}

export interface SourceDoc {
  page_content: string;
  metadata: SourceDocMetadata;
}

export interface ChatRequest {
  query: string;
  history: Message[];
  country?: string;  // Optional country code for jurisdiction-specific rules
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
  responseTime?: number; // in milliseconds
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
