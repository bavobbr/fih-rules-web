import { useRef, useEffect, useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatSidebar } from "@/components/ChatSidebar";
import { AboutDialog } from "@/components/AboutDialog";
import { useChatWithConversations } from "@/hooks/useChatWithConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "@/components/ui/sidebar";

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
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-[100dvh] w-full bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onNewChat={startNewChat}
        />
        <div className="flex flex-col flex-1 h-[100dvh] overflow-hidden">
          <ChatHeader onNewChat={clearChat} isHealthy={isHealthy} onAboutClick={() => setAboutOpen(true)} />
          
          <div className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <WelcomeScreen onExampleClick={sendMessage} onAboutClick={() => setAboutOpen(true)} />
            ) : (
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-4">
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
          </div>
          
          <div className="shrink-0 border-t border-border bg-background">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      </div>
    </SidebarProvider>
  );
};

export default Index;
