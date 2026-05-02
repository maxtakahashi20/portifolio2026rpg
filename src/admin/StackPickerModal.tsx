import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { STACK_CATALOG } from "../data/techStacks";

type Props = {
  open: boolean;
  onClose: () => void;
  stackTokens: string[];
  onToggleCatalogId: (id: string) => void;
  onAddCustom: (label: string) => void;
};

export function StackPickerModal({
  open,
  onClose,
  stackTokens,
  onToggleCatalogId,
  onAddCustom,
}: Props) {
  const [filter, setFilter] = useState("");
  const [customDraft, setCustomDraft] = useState("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragOffsetRef = useRef(dragOffset);
  dragOffsetRef.current = dragOffset;

  useEffect(() => {
    if (open) {
      setFilter("");
      setCustomDraft("");
      setDragOffset({ x: 0, y: 0 });
    }
  }, [open]);

  const dragListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
  } | null>(null);

  useEffect(
    () => () => {
      const L = dragListenersRef.current;
      if (L) {
        window.removeEventListener("pointermove", L.move);
        window.removeEventListener("pointerup", L.up);
        window.removeEventListener("pointercancel", L.up);
      }
    },
    [],
  );

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const o = dragOffsetRef.current;
    const session = {
      ptrId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: o.x,
      originY: o.y,
    };

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== session.ptrId) return;
      setDragOffset({
        x: session.originX + ev.clientX - session.startX,
        y: session.originY + ev.clientY - session.startY,
      });
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== session.ptrId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragListenersRef.current = null;
    };

    dragListenersRef.current = { move, up };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const sorted = useMemo(
    () =>
      [...STACK_CATALOG].sort((a, b) =>
        a.label.localeCompare(b.label, "pt", { sensitivity: "base" }),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q),
    );
  }, [filter, sorted]);

  const addCustom = () => {
    const t = customDraft.trim();
    if (!t) return;
    onAddCustom(t);
    setCustomDraft("");
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="stack-picker-root"
          className="fixed inset-0 z-[5000] flex items-center justify-center px-3 py-6 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-900/75 backdrop-blur-sm"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Escolher tecnologias da stack"
            className="panel-frame relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col overflow-hidden shadow-panel"
            initial={{ opacity: 0, scale: 0.96, x: 0, y: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: dragOffset.x,
              y: dragOffset.y,
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              opacity: { duration: 0.22 },
              scale: { duration: 0.22 },
              x: { duration: 0 },
              y: { duration: 0 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="touch-none select-none border-b border-rune/25"
              onPointerDown={startDrag}
            >
              <div className="flex cursor-grab active:cursor-grabbing flex-wrap items-start justify-between gap-4 px-6 py-5">
                <div className="min-w-0 flex-1">
                  <h2 className="font-rune text-2xl text-rune text-shadow-rune">
                    Tecnologias
                  </h2>
                  <p className="mt-1 font-body text-xs text-parchment-dark">
                    Toque para marcar ou desmarcar. Ícones iguais aos do portfólio.
                  </p>
                  <p className="mt-1 font-display text-[10px] uppercase tracking-[0.2em] text-parchment-dark/70">
                    Arraste este cabeçalho para mover o painel inteiro
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="rune-button h-9 w-9 shrink-0 cursor-pointer px-0 py-0 text-lg"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="border-b border-rune/15 px-6 py-3">
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar por nome…"
                className="w-full rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm text-parchment outline-none ring-rune/35 focus:ring-2"
              />
            </div>

            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((entry) => {
                  const selected = stackTokens.includes(entry.id);
                  const Icon = entry.Icon;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onToggleCatalogId(entry.id)}
                      className={[
                        "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors",
                        selected
                          ? "border-rune bg-ink-900/70 text-rune shadow-rune/20"
                          : "border-rune/20 bg-ink-900/35 text-parchment hover:border-rune/50",
                      ].join(" ")}
                    >
                      <Icon className="h-8 w-8 shrink-0 text-rune" aria-hidden />
                      <span className="font-display text-[10px] uppercase tracking-wider leading-snug">
                        {entry.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <p className="py-8 text-center font-body text-sm text-parchment-dark">
                  Nenhuma tecnologia com esse filtro.
                </p>
              )}
            </div>

            <div className="border-t border-rune/15 bg-ink-900/40 px-6 py-4">
              <p className="font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
                Outra (texto livre)
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  placeholder="Ex.: Solidity, Laravel…"
                  className="min-w-0 flex-1 rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm text-parchment outline-none ring-rune/35 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={addCustom}
                  className="rune-button shrink-0 px-4 py-2 text-xs"
                >
                  Adicionar
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-lg border border-rune/25 py-2 font-display text-xs uppercase tracking-wider text-parchment-dark hover:border-rune hover:text-rune"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
