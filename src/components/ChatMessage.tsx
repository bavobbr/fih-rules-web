import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { TypingIndicator } from "./TypingIndicator";
import { DebugTrace } from "./DebugTrace";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
  shouldAnimate?: boolean;
}

export function ChatMessage({ message, isLatest = false, shouldAnimate = false }: ChatMessageProps) {
  const [hasFinishedTyping, setHasFinishedTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isUser = message.role === "user";

  // Only animate fresh API responses, not cached messages
  const enableAnimation = !isUser && shouldAnimate && !message.isLoading;

  const handleComplete = useCallback(() => {
    setHasFinishedTyping(true);
  }, []);

  const { displayedText, isTyping } = useTypewriter({
    text: message.content,
    speed: 12,
    enabled: enableAnimation,
    onComplete: handleComplete,
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      analytics.messageCopied();
      toast({
        description: "Copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  }, [message.content, toast]);

  const textToShow = enableAnimation ? displayedText : message.content;
  const showCursor = isTyping && enableAnimation;
  const showDebugTrace = !isUser && !message.isLoading && (hasFinishedTyping || !enableAnimation);
  const showCopyButton = !isUser && !message.isLoading && message.content;

  return (
    <div className={`flex flex-col gap-2 animate-fade-in ${isUser ? "items-end" : "items-start"}`}>
      {/* Message content */}
      <div
        className={`max-w-[85%] md:max-w-[75%] relative group ${
          isUser
            ? "px-4 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground"
            : ""
        }`}
      >
        {/* Hover copy button for assistant messages */}
        {showCopyButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="absolute -top-1 -right-9 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        {message.isLoading ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="whitespace-pre-wrap text-base">{textToShow}</p>
        ) : (
          <div className="prose prose-base dark:prose-invert max-w-none prose-p:my-3 prose-p:leading-relaxed prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-headings:my-4 prose-headings:font-semibold prose-headings:tracking-tight text-foreground">
            <ReactMarkdown>{textToShow}</ReactMarkdown>
            {showCursor && (
              <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-[pulse_1s_ease-in-out_infinite]" />
            )}
          </div>
        )}
      </div>

      {/* Sources for assistant messages */}
      {showDebugTrace && <DebugTrace message={message} />}
    </div>
  );
}
