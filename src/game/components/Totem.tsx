import { motion } from "framer-motion";
import type { WorldEntity } from "../types";
import { SECTION_INDEX_BY_ID } from "../../content/portfolio";

type Props = {
  entity: WorldEntity;
  highlighted: boolean;
};

/**
 * "Memory Totem". Stands in for what was originally an axe-able tree: instead
 * of cutting it, the player walks close and presses E to open the matching
 * portfolio section.
 */
export function Totem({ entity, highlighted }: Props) {
  const section = entity.sectionId
    ? SECTION_INDEX_BY_ID[entity.sectionId]
    : undefined;

  return (
    <motion.div
      className="absolute"
      style={{
        translateX: entity.position.x,
        translateY: entity.position.y,
        width: entity.width,
        height: entity.height,
        zIndex: Math.floor(entity.position.y + entity.height),
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-1/2 bottom-2 h-8 w-24 -translate-x-1/2 rounded-full bg-rune/40 blur-2xl"
        animate={{
          opacity: highlighted ? [0.6, 1, 0.6] : 0.5,
          scale: highlighted ? [1, 1.25, 1] : 1,
        }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <motion.div
          className="relative h-[78%] w-[42%] rounded-md border border-rune/40 bg-gradient-to-b from-twilight via-twilight-deep to-ink-900 shadow-rune"
          animate={{
            boxShadow: highlighted
              ? [
                  "0 0 18px rgba(94,232,184,0.42)",
                  "0 0 36px rgba(94,232,184,0.78)",
                  "0 0 18px rgba(94,232,184,0.42)",
                ]
              : "0 0 14px rgba(94,232,184,0.28)",
          }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <div className="absolute inset-x-3 top-3 bottom-3 rounded-sm border border-dashed border-rune/30" />
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-rune text-rune text-shadow-rune"
            style={{ fontSize: Math.min(28, entity.width * 0.28) }}
          >
            {section?.rune ?? "✶"}
          </div>
        </motion.div>

        <motion.div
          className="absolute -top-4 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-rune/80 blur-[2px]"
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: entity.seed % 5 }}
        />
      </div>

      {highlighted && section && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-rune/60 bg-ink-900/90 px-3 py-1 font-display text-sm uppercase tracking-widest text-rune text-shadow-rune"
        >
          {section.title}
        </motion.div>
      )}
    </motion.div>
  );
}
