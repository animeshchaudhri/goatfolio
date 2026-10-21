import { useCallback, useEffect, useRef, useState } from "react";

const LYRICS = [
  "For me, giving up is way harder than trying.",
  "We all self-conscious. I'm just the first to admit it.",
  "I refuse to accept other people's ideas of happiness for me. As if there's a 'one size fits all' standard for happiness.",
  "The prettiest people do the ugliest things.",
  "Believe in your flyness... conquer your shyness.",
];

// Types the quotes into a fresh Untitled document like someone is at the keyboard.
// Stops for good as soon as `stop()` is called (the user types, clicks, or uses a menu).
export function useTypewriter(onType: (text: string) => void, paused: boolean) {
  const [typing, setTyping] = useState(true);
  const stopped = useRef(false);
  const pos = useRef(0);
  const onTypeRef = useRef(onType);
  onTypeRef.current = onType;

  const stop = useCallback(() => {
    stopped.current = true;
    setTyping(false);
  }, []);

  useEffect(() => {
    if (paused || stopped.current) return;
    const target = LYRICS.join("\n");
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (stopped.current) return;
      const i = ++pos.current;
      onTypeRef.current(target.slice(0, i));
      if (i >= target.length) { stop(); return; }
      const ch = target[i - 1];
      // human-ish rhythm: pause at line ends and punctuation
      const delay = ch === "\n" ? 650 : /[.,!?]/.test(ch) ? 180 : 28 + Math.random() * 55;
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [paused, stop]);

  return { typing, stop };
}
