import { motion } from "framer-motion";
import { PLAYER, WORLD } from "../game/world";
import type { PlayerState } from "../game/hooks/usePlayer";
import type { WorldEntity } from "../game/types";

type Props = {
  player: PlayerState;
  entities: WorldEntity[];
};

/**
 * Tiny minimap in the top-right corner. Original site had no minimap, so this
 * adds a mechanically meaningful HUD element that fits the RPG vibe.
 */
export function Minimap({ player, entities }: Props) {
  const w = 160;
  const h = 120;
  const sx = w / WORLD.width;
  const sy = h / WORLD.height;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="pointer-events-none fixed right-4 top-4 z-[1100] panel-frame overflow-hidden"
      style={{ width: w, height: h }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        <rect width={w} height={h} fill="#050d09" />
        <rect
          width={w}
          height={h}
          fill="url(#runeGrid)"
          opacity={0.35}
        />
        <defs>
          <pattern id="runeGrid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#5ee8b8" strokeWidth="0.4" opacity="0.45" />
          </pattern>
        </defs>

        {entities
          .filter((e) => e.kind === "totem")
          .map((e) => (
            <circle
              key={e.id}
              cx={(e.position.x + e.width / 2) * sx}
              cy={(e.position.y + e.height / 2) * sy}
              r={2.6}
              fill="#5ee8b8"
            />
          ))}

        <circle
          cx={(player.position.x + PLAYER.width / 2) * sx}
          cy={(player.position.y + PLAYER.height / 2) * sy}
          r={3}
          fill="#f59e0b"
          stroke="#fff"
          strokeWidth={0.6}
        />
      </svg>
      <span className="absolute bottom-1 right-2 font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
        mapa
      </span>
    </motion.div>
  );
}
