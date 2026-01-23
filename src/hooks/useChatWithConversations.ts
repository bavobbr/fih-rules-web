import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, Message } from "@/types/chat";
import { sendChatMessage, checkHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/hooks/useConversations";
import { analytics } from "@/lib/analytics";

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
  const [shouldAnimateLatest, setShouldAnimateLatest] = useState(false);
  const { toast } = useToast();
  
  // Track if we're in the middle of sending a message to prevent sync issues
  const isSendingRef = useRef(false);
  const prevConversationIdRef = useRef<string | null>(null);

  // Check health on mount
  useEffect(() => {
    checkHealth().then(setIsHealthy);
  }, []);

  // Sync messages with active conversation when switching conversations
  useEffect(() => {
    // Don't sync if we're in the middle of sending a message
    if (isSendingRef.current) return;
    
    // Only sync when the conversation ID actually changes
    if (prevConversationIdRef.current !== activeConversationId) {
      prevConversationIdRef.current = activeConversationId;
      
      // Disable animation when loading cached conversations
      setShouldAnimateLatest(false);
      
      if (activeConversation) {
        setMessages(activeConversation.messages);
      } else {
        setMessages([]);
      }
    }
  }, [activeConversationId, activeConversation]);

  const sendMessage = useCallback(
    async (query: string) => {
      isSendingRef.current = true;
      
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
      let newMessages: ChatMessage[];
      
      if (!currentConversationId) {
        const newConversation = createConversation(userMessage);
        currentConversationId = newConversation.id;
        prevConversationIdRef.current = currentConversationId;
        newMessages = [userMessage, loadingMessage];
      } else {
        newMessages = [...messages, userMessage, loadingMessage];
      }
      
      setMessages(newMessages);
      setIsLoading(true);

      try {
        // Build history from messages (excluding loading message)
        const historyMessages = newMessages.filter(msg => !msg.isLoading && msg.id !== userMessage.id);
        const history: Message[] = historyMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const startTime = Date.now();
        const response = await sendChatMessage(query, history);
        const responseTime = Date.now() - startTime;

        const assistantMessage: ChatMessage = {
          id: loadingMessage.id,
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
          standalone_query: response.standalone_query,
          variant: response.variant,
          source_docs: response.source_docs,
          responseTime,
        };

        // Track successful question
        analytics.questionAsked(response.variant);

        // Enable animation for fresh API response
        setShouldAnimateLatest(true);

        const updatedMessages = newMessages.map(msg =>
          msg.id === loadingMessage.id ? assistantMessage : msg
        );

        setMessages(updatedMessages);
        updateConversation(currentConversationId, updatedMessages);
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        const filteredMessages = newMessages.filter(msg => msg.id !== loadingMessage.id);
        setMessages(filteredMessages);
        if (currentConversationId) {
          updateConversation(currentConversationId, filteredMessages);
        }
      } finally {
        setIsLoading(false);
        isSendingRef.current = false;
      }
    },
    [activeConversationId, messages, createConversation, updateConversation, toast]
  );

  const clearChat = useCallback(() => {
    startNewChat();
    setMessages([]);
    setShouldAnimateLatest(false);
    prevConversationIdRef.current = null;
  }, [startNewChat]);

  return {
    messages,
    isLoading,
    isHealthy,
    shouldAnimateLatest,
    sendMessage,
    clearChat,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    startNewChat,
  };
}
