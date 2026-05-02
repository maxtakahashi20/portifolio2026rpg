import { WORLD } from "../world";

const TILE = WORLD.tileSize;

/**
 * Background ground layer. Uses a procedural CSS gradient mesh so we don't
 * inherit the original sepia/grass look. Subtle rune grid hints at "magic ground".
 */
/** Base + accents only in the green axis (no cyan/magenta shift from blend modes). */
const BASE =
  "radial-gradient(ellipse at 45% 35%, #1b5238 0%, #0c2418 48%, #040a06 100%)";

export function Ground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        width: WORLD.width,
        height: WORLD.height,
        background: BASE,
      }}
    >
      {/* Soft-light keeps hue forest-green; avoid `screen` (puxa azul/roxo no escuro). */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 28%, rgba(63,167,122,0.35), transparent 42%)," +
            "radial-gradient(circle at 78% 58%, rgba(26,90,58,0.28), transparent 48%)," +
            "radial-gradient(circle at 50% 85%, rgba(180,120,40,0.08), transparent 52%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74, 170, 120, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 170, 120, 0.5) 1px, transparent 1px)",
          backgroundSize: `${TILE}px ${TILE}px`,
        }}
      />
      {/* Pouco hue-rotate: rotação grande no PNG empurra o mapa para violeta. */}
      <div
        className="absolute inset-0 opacity-[0.32] mix-blend-multiply"
        style={{
          backgroundImage: "url('/assets/grass.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          filter:
            "saturate(0.42) brightness(0.48) hue-rotate(12deg) contrast(1.05)",
        }}
      />
    </div>
  );
}
