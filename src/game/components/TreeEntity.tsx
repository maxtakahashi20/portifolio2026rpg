import { motion } from "framer-motion";
import type { WorldEntity } from "../types";

/**
 * Decorative tree. Reuses the original tree.png but recolors it with a cool
 * Cool-green foliage tint for the forest biome.
 */
export function TreeEntity({ entity }: { entity: WorldEntity }) {
  const swayDelay = (entity.seed % 50) / 50;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate3d(${entity.position.x}px, ${entity.position.y}px, 0)`,
        width: entity.width,
        height: entity.height,
        zIndex: Math.floor(entity.position.y + entity.height),
      }}
    >
      <div
        className="absolute inset-x-2 bottom-1 h-4 rounded-full bg-black/60 blur-md"
        aria-hidden
      />
      <motion.img
        src="/assets/tree.png"
        alt=""
        draggable={false}
        className="pixelated absolute inset-0 h-full w-full object-contain"
        style={{
          filter:
            "hue-rotate(72deg) saturate(0.88) brightness(0.78) contrast(1.06)",
          transformOrigin: "50% 95%",
        }}
        animate={{ skewX: [0, -1.4, 0, 1.4, 0] }}
        transition={{
          duration: 6 + (entity.seed % 4),
          repeat: Infinity,
          ease: "easeInOut",
          delay: swayDelay,
        }}
      />
    </div>
  );
}
