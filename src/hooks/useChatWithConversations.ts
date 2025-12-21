import { useState, useCallback, useEffect } from "react";
import { ChatMessage, Message } from "@/types/chat";
import { sendChatMessage, checkHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/hooks/useConversations";

export function useChatWithConversations() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
    startNewChat,
  } = useConversations();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check health on mount
  useEffect(() => {
    checkHealth().then(setIsHealthy);
  }, []);

  // Sync messages with active conversation
  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

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

      // If no active conversation, create one with the first message
      let currentConversationId = activeConversationId;
      if (!currentConversationId) {
        const newConversation = createConversation(userMessage);
        currentConversationId = newConversation.id;
        setMessages([userMessage, loadingMessage]);
      } else {
        setMessages(prev => [...prev, userMessage, loadingMessage]);
      }

      setIsLoading(true);

      try {
        // Build history from previous messages (excluding the loading message)
        const currentMessages = activeConversation?.messages || [];
        const history: Message[] = [...currentMessages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await sendChatMessage(query, history.slice(0, -1)); // Exclude the current user message from history

        const assistantMessage: ChatMessage = {
          id: loadingMessage.id,
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
          standalone_query: response.standalone_query,
          variant: response.variant,
          source_docs: response.source_docs,
        };

        setMessages(prev => {
          const updatedMessages = prev.map(msg =>
            msg.id === loadingMessage.id ? assistantMessage : msg
          );
          // Update the conversation with new messages
          if (currentConversationId) {
            updateConversation(currentConversationId, updatedMessages);
          }
          return updatedMessages;
        });
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => msg.id !== loadingMessage.id);
          if (currentConversationId) {
            updateConversation(currentConversationId, filteredMessages);
          }
          return filteredMessages;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, activeConversation, createConversation, updateConversation, toast]
  );

  const clearChat = useCallback(() => {
    startNewChat();
    setMessages([]);
  }, [startNewChat]);

  return {
    messages,
    isLoading,
    isHealthy,
    sendMessage,
    clearChat,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    startNewChat,
  };
}
