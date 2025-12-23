import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { TypingIndicator } from "./TypingIndicator";
import { DebugTrace } from "./DebugTrace";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const [hasFinishedTyping, setHasFinishedTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isUser = message.role === "user";

  const shouldAnimate = !isUser && isLatest && !message.isLoading;

  const handleComplete = useCallback(() => {
    setHasFinishedTyping(true);
  }, []);

  const { displayedText, isTyping } = useTypewriter({
    text: message.content,
    speed: 12,
    enabled: shouldAnimate,
    onComplete: handleComplete,
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
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

  const textToShow = shouldAnimate ? displayedText : message.content;
  const showCursor = isTyping && shouldAnimate;
  const showDebugTrace = !isUser && !message.isLoading && (hasFinishedTyping || !shouldAnimate);
  const showCopyButton = !isUser && !message.isLoading && message.content;

  return (
    <div className={`flex flex-col gap-2 animate-fade-in ${isUser ? "items-end" : "items-start"}`}>
      {/* Message content */}
      <div
        className={`max-w-[85%] md:max-w-[75%] ${
          isUser
            ? "px-4 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground"
            : ""
        }`}
      >
        {message.isLoading ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="whitespace-pre-wrap text-sm md:text-base">{textToShow}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3 prose-headings:font-semibold text-foreground">
            <ReactMarkdown>{textToShow}</ReactMarkdown>
            {showCursor && (
              <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-[pulse_1s_ease-in-out_infinite]" />
            )}
          </div>
        )}
      </div>

      {/* Actions for assistant messages */}
      {showCopyButton && (
        <div className="flex items-center gap-1">
          {showDebugTrace && <DebugTrace message={message} />}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
