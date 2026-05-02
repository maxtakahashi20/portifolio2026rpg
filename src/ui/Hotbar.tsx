import { motion } from "framer-motion";
import { INVENTORY_ITEMS } from "../content/portfolio";

type Props = {
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * Horizontal hotbar at the bottom-right. Differs from the original centered
 * bar so the layout doesn't read as a copy. Numbers 1-4 select the slot.
 */
export function Hotbar({ selectedIndex, onSelect }: Props) {
  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-[1100] flex items-end gap-2">
      {INVENTORY_ITEMS.map((item, i) => {
        const active = i === selectedIndex;
        return (
          <motion.button
            key={item.id}
            onClick={() => onSelect(i)}
            title={`${item.name} — ${item.description}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.06 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.94 }}
            className={[
              "relative flex h-16 w-16 flex-col items-center justify-center rounded-xl border",
              "backdrop-blur transition-colors",
              active
                ? "border-rune bg-ink-800/90 text-rune shadow-rune"
                : "border-rune/25 bg-ink-800/60 text-parchment hover:border-rune/60 hover:text-rune",
            ].join(" ")}
          >
            <span className="font-rune text-3xl leading-none">{item.glyph}</span>
            <span className="mt-1 font-display text-xs uppercase tracking-widest text-parchment-dark">
              {i + 1}
            </span>
            {active && (
              <motion.span
                layoutId="hotbar-active"
                className="absolute inset-0 rounded-xl ring-2 ring-rune/80"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
