import { ChatRequest, ChatResponse, Message } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fih-rag-api-282549120912.europe-west1.run.app";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export async function sendChatMessage(
  query: string,
  history: Message[]
): Promise<ChatResponse> {
  const request: ChatRequest = {
    query,
    history,
  };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
