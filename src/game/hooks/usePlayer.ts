import { useEffect, useRef, useState } from "react";
import {
  CAMERA,
  PLAYER,
  WORLD,
  entityCollisionRect,
  playerCollisionRect,
  rectsIntersect,
} from "../world";
import type { Direction, Vec2, WorldEntity } from "../types";
import type { KeyMap } from "./useKeyboard";

type Options = {
  keys: React.MutableRefObject<KeyMap>;
  entities: WorldEntity[];
  paused: boolean;
  /** Top-left world position to walk toward; cleared when WASD is used or goal reached. */
  moveTargetRef: React.MutableRefObject<Vec2 | null>;
};

export type PlayerState = {
  position: Vec2;
  direction: Direction;
  facing: "left" | "right";
  moving: boolean;
};

const INITIAL: PlayerState = {
  position: { ...PLAYER.spawn },
  direction: "down",
  facing: "right",
  moving: false,
};

/**
 * Drives the player position with requestAnimationFrame.
 * Exposes a snapshot React state (rate-limited) for rendering and a live
 * ref for camera math that needs sub-frame precision.
 */
export function usePlayer({ keys, entities, paused, moveTargetRef }: Options) {
  const liveRef = useRef<PlayerState>({ ...INITIAL, position: { ...INITIAL.position } });
  const [snapshot, setSnapshot] = useState<PlayerState>(liveRef.current);
  const entitiesRef = useRef(entities);
  entitiesRef.current = entities;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    let raf = 0;
    let lastSync = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (pausedRef.current) {
        lastSync = now;
        return;
      }

      const k = keys.current;
      const live = liveRef.current;

      let keyDx = 0;
      let keyDy = 0;
      if (k["w"] || k["arrowup"]) keyDy -= 1;
      if (k["s"] || k["arrowdown"]) keyDy += 1;
      if (k["a"] || k["arrowleft"]) keyDx -= 1;
      if (k["d"] || k["arrowright"]) keyDx += 1;

      const keyboardMoving = keyDx !== 0 || keyDy !== 0;

      let dx = 0;
      let dy = 0;

      if (keyboardMoving) {
        moveTargetRef.current = null;
        dx = keyDx;
        dy = keyDy;
        if (keyDy < 0) live.direction = "up";
        if (keyDy > 0) live.direction = "down";
        if (keyDx < 0) {
          live.direction = "side";
          live.facing = "left";
        }
        if (keyDx > 0) {
          live.direction = "side";
          live.facing = "right";
        }
      } else if (moveTargetRef.current) {
        const target = moveTargetRef.current;
        const pcx = live.position.x + PLAYER.width / 2;
        const pcy = live.position.y + PLAYER.height / 2;
        const tcx = target.x + PLAYER.width / 2;
        const tcy = target.y + PLAYER.height / 2;
        let mx = tcx - pcx;
        let my = tcy - pcy;
        const dist = Math.hypot(mx, my);
        if (dist < 14) {
          moveTargetRef.current = null;
        } else {
          mx /= dist;
          my /= dist;
          dx = mx;
          dy = my;
          if (Math.abs(mx) > Math.abs(my)) {
            live.direction = "side";
            live.facing = mx > 0 ? "right" : "left";
          } else {
            live.direction = my > 0 ? "down" : "up";
          }
        }
      }

      const moving = keyboardMoving || (dx !== 0 || dy !== 0);
      if (moving && (dx !== 0 || dy !== 0)) {
        const len = Math.hypot(dx, dy) || 1;
        const nx = live.position.x + (dx / len) * PLAYER.speed;
        const ny = live.position.y + (dy / len) * PLAYER.speed;

        const tryX = { x: nx, y: live.position.y };
        if (!collides(tryX, entitiesRef.current)) {
          live.position.x = clamp(nx, 0, WORLD.width - PLAYER.width);
        }
        const tryY = { x: live.position.x, y: ny };
        if (!collides(tryY, entitiesRef.current)) {
          live.position.y = clamp(ny, 0, WORLD.height - PLAYER.height);
        }
      }

      live.moving = keyboardMoving || moveTargetRef.current !== null;

      if (now - lastSync > 33) {
        lastSync = now;
        setSnapshot({
          position: { x: live.position.x, y: live.position.y },
          direction: live.direction,
          facing: live.facing,
          moving: live.moving,
        });
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keys, moveTargetRef]);

  return { live: liveRef, state: snapshot };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function collides(pos: Vec2, entities: WorldEntity[]): boolean {
  const me = playerCollisionRect(pos);
  for (const e of entities) {
    const r = entityCollisionRect(e);
    if (rectsIntersect(me, r)) return true;
  }
  return false;
}

export { CAMERA };
