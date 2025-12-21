import { useState, useEffect, useRef, useCallback } from "react";

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
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const textRef = useRef(text);

  // Keep refs updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // If text hasn't changed, don't restart
    if (text === textRef.current && displayedText.length > 0) {
      return;
    }
    
    textRef.current = text;

    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        // Type multiple characters at once for faster feel
        const charsToAdd = Math.min(3, text.length - currentIndex);
        currentIndex += charsToAdd;
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, enabled]);

  const skipToEnd = useCallback(() => {
    setDisplayedText(text);
    setIsTyping(false);
  }, [text]);

  return { displayedText, isTyping, skipToEnd };
}
