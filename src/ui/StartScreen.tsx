import { motion, AnimatePresence } from "framer-motion";
import { HERO_INTRO } from "../content/portfolio";

export function StartScreen({
  visible,
  onStart,
}: {
  visible: boolean;
  onStart: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="start"
          className="fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <BackdropRunes />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 flex max-w-xl flex-col items-center gap-6 px-6 text-center"
          >
            <h1 className="font-rune text-6xl leading-none text-parchment text-shadow-ember sm:text-7xl">
              {HERO_INTRO.authorName}
            </h1>

            <motion.div
              className="mt-2 h-px w-32 bg-gradient-to-r from-transparent via-rune to-transparent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.6, repeat: Infinity }}
            />

            <motion.button
              onClick={onStart}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rune-button mt-4 px-7 py-3 text-2xl"
            >
              <span className="text-rune text-shadow-rune">›</span>
              {HERO_INTRO.callToAction}
              <span className="text-rune text-shadow-rune">‹</span>
            </motion.button>

            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-parchment-dark/70">
              {HERO_INTRO.hint}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BackdropRunes() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(94,232,184,0.14), transparent 55%)," +
            "radial-gradient(ellipse at 50% 78%, rgba(245,158,11,0.09), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-28 [background-size:48px_48px] [background-image:linear-gradient(rgba(94,232,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(94,232,184,0.11)_1px,transparent_1px)]" />
      <FloatingRune left="12%" top="22%" rune="✦" delay={0} />
      <FloatingRune left="82%" top="28%" rune="✷" delay={0.6} />
      <FloatingRune left="20%" top="76%" rune="❖" delay={1.2} />
      <FloatingRune left="78%" top="74%" rune="⌬" delay={0.4} />
      <FloatingRune left="50%" top="14%" rune="✺" delay={1.8} />
    </>
  );
}

function FloatingRune({
  left,
  top,
  rune,
  delay,
}: {
  left: string;
  top: string;
  rune: string;
  delay: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute font-rune text-3xl text-rune/40 text-shadow-rune"
      style={{ left, top }}
      animate={{ y: [0, -10, 0], opacity: [0.3, 0.85, 0.3] }}
      transition={{ duration: 5 + delay, repeat: Infinity, delay }}
    >
      {rune}
    </motion.span>
  );
}
