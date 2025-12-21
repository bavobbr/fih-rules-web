import { useState, useCallback, useEffect } from "react";
import { ChatMessage, Message } from "@/types/chat";
import { sendChatMessage, checkHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "fih-rules-chat-history";

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
  return [];
}

function saveMessages(messages: ChatMessage[]) {
  try {
    // Don't save loading messages
    const toSave = messages.filter((msg) => !msg.isLoading);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkHealth().then(setIsHealthy);
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const sendMessage = useCallback(
    async (query: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      const loadingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);

      try {
        // Build history from previous messages (excluding the loading message)
        const history: Message[] = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await sendChatMessage(query, history);

        const assistantMessage: ChatMessage = {
          id: loadingMessage.id,
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
          standalone_query: response.standalone_query,
          variant: response.variant,
          source_docs: response.source_docs,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id ? assistantMessage : msg
          )
        );
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, toast]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    isHealthy,
    sendMessage,
    clearChat,
  };
}
