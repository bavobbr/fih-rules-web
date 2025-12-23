import { useState, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const { isListening, isSupported, transcript, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setInput((prev) => (prev ? `${prev} ${text}` : text));
    },
    onError: (error) => {
      toast({
        title: "Voice input error",
        description: error,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isListening && transcript) {
      setInput((prev) => {
        const baseText = prev.replace(/\s*\[.*?\]\s*$/, "");
        return baseText ? `${baseText} ${transcript}` : transcript;
      });
    }
  }, [transcript, isListening]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceClick = () => {
    if (!isSupported) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    toggleListening();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto relative">
        {/* Live transcription indicator */}
        {isListening && (
          <div className="absolute -top-12 left-0 right-0 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="text-sm text-muted-foreground">
                {transcript ? (
                  <span className="text-foreground">{transcript}</span>
                ) : (
                  "Listening..."
                )}
              </span>
            </div>
          </div>
        )}

        {/* Input container - pill shaped */}
        <div className="flex items-end gap-2 p-2 rounded-2xl border border-border bg-card shadow-sm">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about rules"
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-2"
            rows={1}
          />
          <div className="flex items-center gap-1 pb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleVoiceClick}
                  disabled={disabled}
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-xl shrink-0 ${
                    isListening 
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? "Stop recording" : isSupported ? "Voice input" : "Voice not supported"}
              </TooltipContent>
            </Tooltip>
            <Button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
