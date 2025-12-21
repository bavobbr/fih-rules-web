import { useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useChatWithConversations } from "@/hooks/useChatWithConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const {
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
  } = useChatWithConversations();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onNewChat={startNewChat}
        />
        <div className="flex flex-col flex-1 h-screen">
          <ChatHeader onNewChat={clearChat} isHealthy={isHealthy} />
          
          {messages.length === 0 ? (
            <WelcomeScreen onExampleClick={sendMessage} />
          ) : (
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-6 space-y-6 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isLatest={index === messages.length - 1}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
          
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
