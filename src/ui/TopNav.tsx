import { motion } from "framer-motion";
import { PORTFOLIO_SECTIONS } from "../content/portfolio";
import type { PortfolioSectionId } from "../game/types";

type Props = {
  activeId: PortfolioSectionId | null;
  visitedIds: Set<PortfolioSectionId>;
  onSelect: (id: PortfolioSectionId) => void;
};

/**
 * Side navigation rail with section "sigils". Replaces the original centered
 * top button bar to give the new layout a different shape.
 */
export function TopNav({ activeId, visitedIds, onSelect }: Props) {
  return (
    <nav
      aria-label="Atalhos do vale"
      className="fixed left-4 top-1/2 z-[1100] flex -translate-y-1/2 flex-col gap-3"
    >
      {PORTFOLIO_SECTIONS.map((s, i) => {
        const visited = visitedIds.has(s.id);
        const isActive = activeId === s.id;
        return (
          <motion.button
            key={s.id}
            onClick={() => onSelect(s.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.94 }}
            className={[
              "group relative flex items-center gap-3 rounded-xl border px-3 py-2 backdrop-blur",
              "transition-colors duration-200",
              isActive
                ? "border-rune bg-ink-800/90 text-rune shadow-rune"
                : "border-rune/25 bg-ink-800/55 text-parchment hover:border-rune/70 hover:text-rune",
            ].join(" ")}
          >
            <span
              className="font-rune text-2xl leading-none"
              aria-hidden
            >
              {s.rune}
            </span>
            <span className="hidden flex-col text-left sm:flex">
              <span className="font-display text-base uppercase tracking-widest">
                {s.title}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-parchment-dark/80">
                {s.subtitle}
              </span>
            </span>
            {visited && (
              <span
                aria-label="Visitado"
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-ember shadow-ember"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
