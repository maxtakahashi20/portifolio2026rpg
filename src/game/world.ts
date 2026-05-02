import type {
  PortfolioSectionId,
  Rect,
  Vec2,
  WorldEntity,
} from "./types";

export const WORLD = {
  width: 6400,
  height: 4800,
  tileSize: 96,
} as const;

export const PLAYER = {
  width: 96,
  height: 96,
  speed: 4.4,
  collisionInset: { top: 56, left: 28, right: 28, bottom: 8 },
  spawn: { x: WORLD.width / 2, y: WORLD.height / 2 } satisfies Vec2,
} as const;

export const CAMERA = {
  zoom: 1.15,
  margin: 64,
} as const;

const SECTION_BIAS: { id: PortfolioSectionId; offset: Vec2 }[] = [
  { id: "origem", offset: { x: -520, y: -360 } },
  { id: "feitos", offset: { x: 540, y: -300 } },
  { id: "projetos", offset: { x: -720, y: -120 } },
  { id: "grimorio", offset: { x: -640, y: 320 } },
  { id: "cronica", offset: { x: 600, y: 360 } },
  { id: "pacto", offset: { x: 0, y: 620 } },
];

/** Deterministic pseudo-random so totems/trees stay in the same place between renders. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWorld(seed = 1337): WorldEntity[] {
  const rand = mulberry32(seed);
  const entities: WorldEntity[] = [];

  const center = { x: WORLD.width / 2, y: WORLD.height / 2 };

  SECTION_BIAS.forEach((s, i) => {
    entities.push({
      id: `totem-${s.id}`,
      kind: "totem",
      position: {
        x: center.x + s.offset.x,
        y: center.y + s.offset.y,
      },
      width: 110,
      height: 170,
      sectionId: s.id,
      seed: i * 97 + 13,
    });
  });

  const cols = Math.ceil(WORLD.width / 420);
  const rows = Math.ceil(WORLD.height / 360);
  let id = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rand() > 0.55) continue;

      const baseX = col * 420 + (rand() - 0.5) * 280;
      const baseY = row * 360 + (rand() - 0.5) * 240;

      const dx = baseX - center.x;
      const dy = baseY - center.y;
      if (Math.hypot(dx, dy) < 280) continue;

      let tooClose = false;
      for (const totem of entities) {
        if (totem.kind !== "totem") continue;
        const tdx = totem.position.x - baseX;
        const tdy = totem.position.y - baseY;
        if (Math.hypot(tdx, tdy) < 220) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const scale = 0.85 + rand() * 0.45;
      entities.push({
        id: `tree-${id++}`,
        kind: "tree",
        position: { x: baseX, y: baseY },
        width: 120 * scale,
        height: 170 * scale,
        seed: id * 31 + Math.floor(rand() * 999),
      });
    }
  }

  return entities;
}

export function playerCollisionRect(pos: Vec2): Rect {
  return {
    left: pos.x + PLAYER.collisionInset.left,
    right: pos.x + PLAYER.width - PLAYER.collisionInset.right,
    top: pos.y + PLAYER.collisionInset.top,
    bottom: pos.y + PLAYER.height - PLAYER.collisionInset.bottom,
  };
}

export function entityCollisionRect(e: WorldEntity): Rect {
  const trunkH = e.height * 0.32;
  const trunkW = Math.max(28, e.width * 0.32);
  const cx = e.position.x + e.width / 2;
  const baseY = e.position.y + e.height;
  return {
    left: cx - trunkW / 2,
    right: cx + trunkW / 2,
    top: baseY - trunkH,
    bottom: baseY,
  };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

export function distanceBetween(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Returns the closest interactable entity within range, or null. */
export function findNearestInteractable(
  playerPos: Vec2,
  entities: WorldEntity[],
  maxDistance = 180,
): WorldEntity | null {
  const playerCenter = {
    x: playerPos.x + PLAYER.width / 2,
    y: playerPos.y + PLAYER.height / 2,
  };
  let nearest: WorldEntity | null = null;
  let best = maxDistance;
  for (const e of entities) {
    if (!e.sectionId) continue;
    const target = {
      x: e.position.x + e.width / 2,
      y: e.position.y + e.height * 0.7,
    };
    const d = distanceBetween(playerCenter, target);
    if (d < best) {
      best = d;
      nearest = e;
    }
  }
  return nearest;
}

export function clampPlayerPosition(pos: Vec2): Vec2 {
  return {
    x: Math.max(0, Math.min(WORLD.width - PLAYER.width, pos.x)),
    y: Math.max(0, Math.min(WORLD.height - PLAYER.height, pos.y)),
  };
}

/** Same math as the Scene camera layer so clicks map to world coords. */
export function getCameraOffset(
  playerPos: Vec2,
  viewport: { width: number; height: number },
): Vec2 {
  const center = {
    x: playerPos.x + PLAYER.width / 2,
    y: playerPos.y + PLAYER.height / 2,
  };
  let x = viewport.width / 2 - center.x * CAMERA.zoom;
  let y = viewport.height / 2 - center.y * CAMERA.zoom;
  const minX = viewport.width - WORLD.width * CAMERA.zoom;
  const minY = viewport.height - WORLD.height * CAMERA.zoom;
  if (x > 0) x = 0;
  if (y > 0) y = 0;
  if (x < minX) x = minX;
  if (y < minY) y = minY;
  return { x, y };
}

export function screenToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  playerPos: Vec2,
  viewport: { width: number; height: number },
): Vec2 {
  const off = getCameraOffset(playerPos, viewport);
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  return {
    x: (sx - off.x) / CAMERA.zoom,
    y: (sy - off.y) / CAMERA.zoom,
  };
}

/** Player top-left goal: stand just below the totem center. */
export function playerGoalNearTotem(entity: WorldEntity): Vec2 {
  const x = entity.position.x + entity.width / 2 - PLAYER.width / 2;
  const y = entity.position.y + entity.height - PLAYER.height - 12;
  return clampPlayerPosition({ x, y });
}
