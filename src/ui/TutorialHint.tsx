import { motion, AnimatePresence } from "framer-motion";

type Props = { visible: boolean };

export function TutorialHint({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 panel-frame px-5 py-4"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <Key label="W" />
              <div className="flex gap-1">
                <Key label="A" />
                <Key label="S" />
                <Key label="D" />
              </div>
            </div>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-parchment-dark">
              Caminhe · pressione{" "}
              <span className="text-rune text-shadow-rune">E</span> em um totem
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Key({ label }: { label: string }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rune/50 bg-ink-900/80 font-display text-lg text-rune text-shadow-rune">
      {label}
    </span>
  );
}
