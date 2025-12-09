import { useState, useEffect, useCallback } from "react";

interface UseTypewriterOptions {
  speed?: number; // ms per character
  delay?: number; // initial delay before typing starts
  onComplete?: () => void;
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
) {
  const { speed = 15, delay = 500, onComplete } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startTyping = useCallback(() => {
    if (!text) return;
    
    setDisplayedText("");
    setIsComplete(false);
    setIsTyping(true);

    // Initial delay (thinking time)
    const delayTimer = setTimeout(() => {
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [text, speed, delay, onComplete]);

  useEffect(() => {
    const cleanup = startTyping();
    return cleanup;
  }, [startTyping]);

  return { displayedText, isTyping, isComplete };
}

// Simpler version - just add delay before showing full text
export function useDelayedResponse(
  text: string | null,
  thinkingDelay: number = 1000
) {
  const [showResponse, setShowResponse] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (text) {
      setIsThinking(true);
      setShowResponse(false);
      
      const timer = setTimeout(() => {
        setIsThinking(false);
        setShowResponse(true);
      }, thinkingDelay);

      return () => clearTimeout(timer);
    }
  }, [text, thinkingDelay]);

  return { showResponse, isThinking };
}
