export type Direction = "up" | "down" | "side";

export type Vec2 = { x: number; y: number };

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type WorldEntityKind = "totem" | "tree";

export type WorldEntity = {
  id: string;
  kind: WorldEntityKind;
  position: Vec2;
  width: number;
  height: number;
  /** Optional reference to a portfolio section unlocked by interacting. */
  sectionId?: PortfolioSectionId;
  /** Cosmetic seed for sway phase, scale variation, etc. */
  seed: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  glyph: string;
  description: string;
};

export type PortfolioSectionId =
  | "origem"
  | "feitos"
  | "grimorio"
  | "cronica"
  | "pacto";

export type PortfolioSection = {
  id: PortfolioSectionId;
  title: string;
  subtitle: string;
  rune: string;
  body: PortfolioBlock[];
};

export type PortfolioBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "list"; label: string; items: string[] }
  | { type: "links"; items: { label: string; url: string; glyph?: string }[] };
