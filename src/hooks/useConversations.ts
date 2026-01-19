import { useState, useCallback, useEffect } from "react";
import { Conversation, ChatMessage } from "@/types/chat";
import { analytics } from "@/lib/analytics";

const CONVERSATIONS_KEY = "fih-rules-conversations";
const ACTIVE_CONVERSATION_KEY = "fih-rules-active-conversation";

function generateTitle(firstMessage: string): string {
  const maxLength = 50;
  const truncated = firstMessage.length > maxLength 
    ? firstMessage.substring(0, maxLength) + "..." 
    : firstMessage;
  return truncated;
}

function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((conv: Conversation) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
  } catch (error) {
    console.error("Failed to load conversations:", error);
  }
  return [];
}

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Failed to save conversations:", error);
  }
}

function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function saveActiveConversationId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error("Failed to save active conversation ID:", error);
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  // Always start with no active conversation (fresh homepage)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Save conversations whenever they change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Save active conversation ID whenever it changes
  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createConversation = useCallback((firstMessage: ChatMessage): Conversation => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: generateTitle(firstMessage.content),
      messages: [firstMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    analytics.conversationCreated();
    return newConversation;
  }, []);

  const updateConversation = useCallback((id: string, messages: ChatMessage[]) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === id) {
        return {
          ...conv,
          messages: messages.filter(msg => !msg.isLoading),
          updatedAt: new Date(),
        };
      }
      return conv;
    }));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    analytics.conversationDeleted();
  }, [activeConversationId]);

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
    startNewChat,
  };
}
