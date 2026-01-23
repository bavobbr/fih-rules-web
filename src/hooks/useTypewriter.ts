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
    let lastTime = Date.now();
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTime;
      
      // Calculate how many characters should be typed based on elapsed time
      // This ensures animation catches up even if throttled
      const charsPerMs = 3 / speed;
      const charsToType = Math.max(1, Math.floor(elapsed * charsPerMs));
      
      if (currentIndex < text.length) {
        currentIndex = Math.min(currentIndex + charsToType, text.length);
        setDisplayedText(text.slice(0, currentIndex));
        lastTime = now;
        
        if (currentIndex < text.length) {
          timeoutId = setTimeout(tick, speed);
        } else {
          setIsTyping(false);
          onCompleteRef.current?.();
        }
      } else {
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    };

    timeoutId = setTimeout(tick, speed);

    return () => clearTimeout(timeoutId);
  }, [text, speed, enabled]);

  const skipToEnd = useCallback(() => {
    setDisplayedText(text);
    setIsTyping(false);
  }, [text]);

  return { displayedText, isTyping, skipToEnd };
}
