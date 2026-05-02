import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioSection } from "../game/types";

type Props = { section: PortfolioSection | null };

/**
 * Floating "press E" hint that appears when the player is near an interactable
 * totem.
 */
export function InteractionPrompt({ section }: Props) {
  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed left-1/2 top-[20%] z-[1050] -translate-x-1/2"
        >
          <div className="panel-frame flex items-center gap-3 px-4 py-2">
            <span className="font-rune text-2xl text-rune text-shadow-rune">
              {section.rune}
            </span>
            <span className="font-display uppercase tracking-[0.3em] text-parchment">
              Invocar {section.title}
            </span>
            <span className="ml-2 inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-rune/60 bg-ink-900/80 px-2 font-display text-rune text-shadow-rune">
              E
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
