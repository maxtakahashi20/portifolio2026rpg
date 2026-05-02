import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scene } from "../game/components/Scene";
import { useKeyPress, useKeyboard } from "../game/hooks/useKeyboard";
import { usePlayer } from "../game/hooks/usePlayer";
import { useViewport } from "../game/hooks/useViewport";
import {
  PLAYER,
  clampPlayerPosition,
  findNearestInteractable,
  generateWorld,
  playerGoalNearTotem,
  screenToWorld,
} from "../game/world";
import {
  HERO_INTRO,
  PORTFOLIO_SECTIONS,
  SECTION_INDEX_BY_ID,
} from "../content/portfolio";
import type { PortfolioSectionId, Vec2 } from "../game/types";
import { StartScreen } from "../ui/StartScreen";
import { TopNav } from "../ui/TopNav";
import { Hotbar } from "../ui/Hotbar";
import { TutorialHint } from "../ui/TutorialHint";
import { InteractionPrompt } from "../ui/InteractionPrompt";
import { PortfolioPanel } from "../ui/PortfolioPanel";
import { Minimap } from "../ui/Minimap";

export default function App() {
  const [started, setStarted] = useState(false);
  const [activePanel, setActivePanel] = useState<PortfolioSectionId | null>(null);
  const [visited, setVisited] = useState<Set<PortfolioSectionId>>(() => new Set());
  const [hotbarIndex, setHotbarIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  /** Menu: só caminha até o totem; o painel abre quando chegar perto (ou com E). */
  const [pendingSectionOpen, setPendingSectionOpen] =
    useState<PortfolioSectionId | null>(null);

  const moveTargetRef = useRef<Vec2 | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const viewport = useViewport();
  const entities = useMemo(() => generateWorld(7), []);

  const inputDisabled = !started || activePanel !== null;
  const keys = useKeyboard(inputDisabled);
  const player = usePlayer({
    keys,
    entities,
    paused: inputDisabled,
    moveTargetRef,
  });

  const handleWorldPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!started || activePanel) return;
      if (e.button !== 0) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const world = screenToWorld(
        e.clientX,
        e.clientY,
        rect,
        player.live.current.position,
        viewport,
      );
      moveTargetRef.current = clampPlayerPosition({
        x: world.x - PLAYER.width / 2,
        y: world.y - PLAYER.height / 2,
      });
      setPendingSectionOpen(null);
    },
    [started, activePanel, player.live, viewport],
  );

  const openPanelNow = useCallback((id: PortfolioSectionId) => {
    setActivePanel(id);
    setPendingSectionOpen(null);
    moveTargetRef.current = null;
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const startWalkToTotem = useCallback(
    (id: PortfolioSectionId) => {
      const totem = entities.find(
        (en) => en.kind === "totem" && en.sectionId === id,
      );
      if (!totem) {
        openPanelNow(id);
        return;
      }
      moveTargetRef.current = playerGoalNearTotem(totem);
      setPendingSectionOpen(id);
    },
    [entities, openPanelNow],
  );

  /** Ao chegar perto do totem escolhido no menu, abre o painel. */
  useEffect(() => {
    if (!pendingSectionOpen || !started || activePanel) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const totem = entities.find(
        (e) => e.kind === "totem" && e.sectionId === pendingSectionOpen,
      );
      if (!totem) return;
      const pos = player.live.current.position;
      const pc = {
        x: pos.x + PLAYER.width / 2,
        y: pos.y + PLAYER.height / 2,
      };
      const tp = {
        x: totem.position.x + totem.width / 2,
        y: totem.position.y + totem.height * 0.7,
      };
      const d = Math.hypot(pc.x - tp.x, pc.y - tp.y);
      if (d < 175) {
        openPanelNow(pendingSectionOpen);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    pendingSectionOpen,
    started,
    activePanel,
    entities,
    player.live,
    openPanelNow,
  ]);

  /** Cancela “ir ler o totem” se o jogador usar WASD ou mudar o destino no mapa. */
  useEffect(() => {
    if (!pendingSectionOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
          e.key.toLowerCase(),
        )
      ) {
        setPendingSectionOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingSectionOpen]);

  // Track nearest interactable for highlight + prompt.
  const nearestRef = useRef(highlightedId);
  useEffect(() => {
    if (inputDisabled) {
      setHighlightedId(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      const near = findNearestInteractable(
        player.live.current.position,
        entities,
      );
      const id = near?.id ?? null;
      if (id !== nearestRef.current) {
        nearestRef.current = id;
        setHighlightedId(id);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inputDisabled, entities, player.live]);

  // Hide tutorial after the first movement key.
  useEffect(() => {
    if (!started) return;
    const dismiss = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        setShowTutorial(false);
      }
    };
    window.addEventListener("keydown", dismiss);
    const t = setTimeout(() => setShowTutorial(false), 9000);
    return () => {
      window.removeEventListener("keydown", dismiss);
      clearTimeout(t);
    };
  }, [started]);

  // Hotbar number keys.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= 4) {
        setHotbarIndex(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  // E: abre na hora se já estiver perto do totem.
  useKeyPress(
    "e",
    () => {
      if (!highlightedId) return;
      const entity = entities.find((e) => e.id === highlightedId);
      if (!entity?.sectionId) return;
      openPanelNow(entity.sectionId);
    },
    { disabled: inputDisabled },
  );

  // ESC to close the active panel.
  useKeyPress(
    "Escape",
    () => {
      if (activePanel) setActivePanel(null);
    },
    { disabled: !started },
  );

  const closePanel = useCallback(() => setActivePanel(null), []);

  const promptSection = useMemo(() => {
    if (!highlightedId || activePanel) return null;
    const entity = entities.find((e) => e.id === highlightedId);
    if (!entity?.sectionId) return null;
    return SECTION_INDEX_BY_ID[entity.sectionId] ?? null;
  }, [highlightedId, activePanel, entities]);

  const activeSection = activePanel
    ? SECTION_INDEX_BY_ID[activePanel] ?? null
    : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Scene
        ref={sceneRef}
        player={player.state}
        entities={entities}
        viewport={viewport}
        highlightedId={highlightedId}
        onWorldPointerDown={handleWorldPointerDown}
        interactive={started && !activePanel}
      />

      {started && (
        <>
          <Minimap player={player.state} entities={entities} />
          <TopNav
            activeId={activePanel ?? pendingSectionOpen}
            visitedIds={visited}
            onSelect={startWalkToTotem}
          />
          <Hotbar selectedIndex={hotbarIndex} onSelect={setHotbarIndex} />
          <TutorialHint visible={showTutorial} />
          <InteractionPrompt section={promptSection} />
          <Brand />
        </>
      )}

      <PortfolioPanel section={activeSection} onClose={closePanel} />

      <StartScreen visible={!started} onStart={() => setStarted(true)} />
    </div>
  );
}

function Brand() {
  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[1100] -translate-x-1/2 text-center">
      <p className="font-rune text-2xl text-parchment text-shadow-rune">
        {HERO_INTRO.authorName}
      </p>
      <p className="font-display text-[10px] uppercase tracking-[0.45em] text-parchment-dark">
        portfólio · {PORTFOLIO_SECTIONS.length} totens
      </p>
    </div>
  );
}
