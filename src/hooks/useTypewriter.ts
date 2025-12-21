import { useState, useEffect, useCallback } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 15,
  enabled = true,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }

    if (!text) {
      setDisplayedText("");
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        // Type multiple characters at once for faster feel
        const charsToAdd = Math.min(3, text.length - currentIndex);
        setDisplayedText(text.slice(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, enabled, onComplete]);

  const skipToEnd = useCallback(() => {
    setDisplayedText(text);
    setIsTyping(false);
  }, [text]);

  return { displayedText, isTyping, skipToEnd };
}
