import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Bot, Copy, Check } from "lucide-react";
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

  // Only animate the latest assistant message that just arrived
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
    <div
      className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="group relative">
          <Card
            className={`px-4 py-3 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card text-card-foreground"
            }`}
          >
            {message.isLoading ? (
              <TypingIndicator />
            ) : isUser ? (
              <p className="whitespace-pre-wrap">{textToShow}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:font-semibold">
                <ReactMarkdown>{textToShow}</ReactMarkdown>
                {showCursor && (
                  <span className="inline-block w-0.5 h-5 bg-current ml-0.5 animate-[pulse_1s_ease-in-out_infinite]" />
                )}
              </div>
            )}
          </Card>
          
          {showCopyButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="absolute -right-10 top-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>

        {showDebugTrace && <DebugTrace message={message} />}
      </div>
    </div>
  );
}
