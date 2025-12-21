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

  // Update input with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput((prev) => {
        // If we already have text, append the transcript
        const baseText = prev.replace(/\s*\[.*?\]\s*$/, ""); // Remove any previous interim marker
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
    <div className="flex gap-3 p-4 border-t border-border bg-card">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about FIH rules... (e.g., 'Can I hit the ball in indoor?')"
        disabled={disabled}
        className="min-h-[52px] max-h-[200px] resize-none"
        rows={1}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              onClick={handleVoiceClick}
              disabled={disabled}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={`shrink-0 h-[52px] w-[52px] ${isListening ? "animate-pulse" : ""}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {isListening ? "Stop recording" : isSupported ? "Voice input" : "Voice not supported"}
        </TooltipContent>
      </Tooltip>
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        variant="gradient"
        size="icon"
        className="shrink-0 h-[52px] w-[52px]"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
