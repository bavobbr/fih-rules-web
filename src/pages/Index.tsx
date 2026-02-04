import { useRef, useEffect, useState, useCallback } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatSidebar } from "@/components/ChatSidebar";
import { AboutDialog } from "@/components/AboutDialog";
import { SourcesDialog } from "@/components/SourcesDialog";
import { useChatWithConversations } from "@/hooks/useChatWithConversations";
import { SidebarProvider } from "@/components/ui/sidebar";
import { fetchCountries } from "@/lib/api";
import { Country } from "@/types/chat";

const Index = () => {
  const {
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
  } = useChatWithConversations();
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const prevMessageCountRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Callback when typewriter animation state changes
  const handleTypingChange = useCallback((typing: boolean) => {
    setIsAnimating(typing);
  }, []);

  // Country selection state - persists throughout conversation
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("international");
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .finally(() => setIsLoadingCountries(false));
  }, []);

  // Wrapper to send messages with country parameter
  const handleSendMessage = (message: string) => {
    const countryCode = selectedCountry === "international" ? undefined : selectedCountry;
    sendMessage(message, countryCode);
  };

  // Enhanced clearChat that also resets country selection
  const handleClearChat = () => {
    clearChat();
    setSelectedCountry("international");
  };

  // Scroll the latest user question to the top when submitted
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // Check if new messages were added
    if (currentCount > prevCount && messages.length >= 2) {
      // When user sends a message, both user message and loading message are added together
      // So check the second-to-last message if count increased by 2 or more
      const countDiff = currentCount - prevCount;
      const secondToLast = messages[messages.length - 2];

      // If 2+ messages were added and second-to-last is user, it's a new question
      if (countDiff >= 2 && secondToLast?.role === "user" && viewportRef.current) {
        // Wait for DOM to fully update
        setTimeout(() => {
          if (lastUserMessageRef.current && viewportRef.current) {
            // Get the offset of the element within its scroll container
            const messageElement = lastUserMessageRef.current;
            const scrollContainer = viewportRef.current;

            // Get the element's position relative to its offset parent
            let offsetTop = 0;
            let element: HTMLElement | null = messageElement;
            while (element && element !== scrollContainer) {
              offsetTop += element.offsetTop;
              element = element.offsetParent as HTMLElement;
            }

            // Scroll to bring element to top with some padding
            const targetScrollTop = offsetTop - 16; // 16px padding from top

            // Scroll the viewport
            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: "smooth"
            });
          }
        }, 100);
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages]);

  // Auto-scroll during typewriter animation to keep new text visible
  useEffect(() => {
    if (!isAnimating || !viewportRef.current || !lastMessageRef.current) return;

    const scrollContainer = viewportRef.current;
    const messageElement = lastMessageRef.current;

    // Use MutationObserver to detect when message content changes
    const observer = new MutationObserver(() => {
      // Check if we're near the bottom (within 200px) - if so, keep scrolling
      const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 200;

      if (isNearBottom) {
        // Scroll to show the latest content
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "auto" // Use auto for smooth continuous scrolling during animation
        });
      }
    });

    observer.observe(messageElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isAnimating]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-full w-full bg-background pt-[var(--safe-area-inset-top)] pb-[var(--safe-area-inset-bottom)] pl-[var(--safe-area-inset-left)] pr-[var(--safe-area-inset-right)]">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onNewChat={startNewChat}
        />
        <div className="flex flex-col flex-1 h-[100dvh] overflow-hidden">
          <ChatHeader onNewChat={handleClearChat} isHealthy={isHealthy} onAboutClick={() => setAboutOpen(true)} onSourcesClick={() => setSourcesOpen(true)} />

          <div className="flex-1 overflow-y-auto" ref={viewportRef}>
            {messages.length === 0 ? (
              <WelcomeScreen
                countries={countries}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                isLoadingCountries={isLoadingCountries}
                onSend={handleSendMessage}
                onAboutClick={() => setAboutOpen(true)}
                onSourcesClick={() => setSourcesOpen(true)}
                disabled={isLoading}
              />
            ) : (
              <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-4">
                {messages.map((message, index) => {
                  // Find if this is the last user message
                  const isLastUserMessage = message.role === "user" &&
                    !messages.slice(index + 1).some(m => m.role === "user");
                  const isLastMessage = index === messages.length - 1;

                  return (
                    <div
                      key={message.id}
                      ref={isLastUserMessage ? lastUserMessageRef : (isLastMessage ? lastMessageRef : null)}
                    >
                      <ChatMessage
                        message={message}
                        isLatest={isLastMessage}
                        shouldAnimate={shouldAnimateLatest && isLastMessage}
                        onTypingChange={isLastMessage ? handleTypingChange : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {messages.length > 0 && (
            <div className="shrink-0 relative">
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              <div className="border-t border-border bg-muted/30 pb-[var(--safe-area-inset-bottom)]">
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
              </div>
            </div>
          )}
        </div>
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
        <SourcesDialog open={sourcesOpen} onOpenChange={setSourcesOpen} />
      </div>
    </SidebarProvider>
  );
};

export default Index;
