import { forwardRef, useMemo } from "react";
import { CAMERA, WORLD, getCameraOffset } from "../world";
import type { PlayerState } from "../hooks/usePlayer";
import type { WorldEntity } from "../types";
import { Ground } from "./Ground";
import { PlayerSprite } from "./PlayerSprite";
import { Totem } from "./Totem";
import { TreeEntity } from "./TreeEntity";

type Props = {
  player: PlayerState;
  entities: WorldEntity[];
  viewport: { width: number; height: number };
  highlightedId: string | null;
  /** Click/tap no mapa: mover até o ponto (coordenadas tratadas no App). */
  onWorldPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  /** Mostra cursor de mira no chão quando o jogo está ativo. */
  interactive?: boolean;
};

/**
 * The world layer. The whole "cenario" is translated under a fixed-size
 * camera so the player visually stays near the center.
 */
export const Scene = forwardRef<HTMLDivElement, Props>(function Scene(
  {
    player,
    entities,
    viewport,
    highlightedId,
    onWorldPointerDown,
    interactive,
  },
  ref,
) {
  const offset = useMemo(
    () => getCameraOffset(player.position, viewport),
    [player.position.x, player.position.y, viewport.width, viewport.height],
  );

  const visible = useMemo(() => {
    const buffer = 600;
    const left = -offset.x / CAMERA.zoom - buffer;
    const top = -offset.y / CAMERA.zoom - buffer;
    const right = left + viewport.width / CAMERA.zoom + buffer * 2;
    const bottom = top + viewport.height / CAMERA.zoom + buffer * 2;

    return entities.filter((e) => {
      return (
        e.position.x + e.width > left &&
        e.position.x < right &&
        e.position.y + e.height > top &&
        e.position.y < bottom
      );
    });
  }, [entities, offset.x, offset.y, viewport.width, viewport.height]);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden vignette select-none ${
        interactive ? "cursor-crosshair touch-none" : "cursor-default"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #174530 0%, #07140f 55%, #020403 100%)",
      }}
      onPointerDown={onWorldPointerDown}
      role="application"
      aria-label="Mapa do portfolio — clique para caminhar"
    >
      <div
        className="pointer-events-none absolute origin-top-left will-change-transform"
        style={{
          width: WORLD.width,
          height: WORLD.height,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${CAMERA.zoom})`,
        }}
      >
        <Ground />
        {visible.map((e) => {
          if (e.kind === "totem") {
            return (
              <Totem key={e.id} entity={e} highlighted={e.id === highlightedId} />
            );
          }
          return <TreeEntity key={e.id} entity={e} />;
        })}
        <PlayerSprite state={player} />
      </div>
    </div>
  );
});

Scene.displayName = "Scene";
