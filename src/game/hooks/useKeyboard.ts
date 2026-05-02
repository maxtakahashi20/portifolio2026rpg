import { useEffect, useRef } from "react";

export type KeyMap = Record<string, boolean>;

/**
 * Tracks a stable ref of currently-pressed keys (lower-cased). Subscribers
 * read it inside an animation loop without forcing React re-renders.
 */
export function useKeyboard(disabled = false) {
  const keys = useRef<KeyMap>({});

  useEffect(() => {
    if (disabled) {
      keys.current = {};
      return;
    }
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [disabled]);

  return keys;
}

/** One-shot key listener (key down). */
export function useKeyPress(
  key: string,
  handler: () => void,
  options: { disabled?: boolean } = {},
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (options.disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        handlerRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, options.disabled]);
}
