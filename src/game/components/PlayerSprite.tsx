import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerState } from "../hooks/usePlayer";
import { PLAYER } from "../world";

const SPRITES: Record<string, string> = {
  "idle-down": "/assets/character-idle-down.gif",
  "idle-up": "/assets/character-idle-up.gif",
  "idle-side": "/assets/character-idle-side.gif",
  "walk-down": "/assets/character-walk-down.gif",
  "walk-up": "/assets/character-walk-up.gif",
  "walk-side": "/assets/character-walk-side.gif",
};

/**
 * Sprite layer rendered at the player's world coordinates. Keeps the original
 * GIF frames with a subtle forest-night tint.
 */
export function PlayerSprite({ state }: { state: PlayerState }) {
  const action = state.moving ? "walk" : "idle";
  const key = `${action}-${state.direction}`;
  const [src, setSrc] = useState(SPRITES[key]);

  useEffect(() => {
    setSrc(`${SPRITES[key]}?v=${Date.now()}`);
  }, [key]);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: PLAYER.width,
        height: PLAYER.height,
        translateX: state.position.x,
        translateY: state.position.y,
        zIndex: Math.floor(state.position.y + PLAYER.height),
        filter: "hue-rotate(18deg) saturate(1.08) brightness(0.96) contrast(1.03)",
      }}
      transition={{ type: "tween", duration: 0 }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-1 h-3 w-16 rounded-full bg-rune/30 blur-md"
        aria-hidden
      />
      <img
        src={src}
        alt=""
        className="pixelated absolute inset-0 h-full w-full object-contain"
        style={{
          transform: state.facing === "left" ? "scaleX(-1)" : "scaleX(1)",
        }}
        draggable={false}
      />
    </motion.div>
  );
}
