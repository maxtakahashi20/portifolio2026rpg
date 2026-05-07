import { resolveStack } from "../data/techStacks";

type Props = {
  stacks?: string[] | null;
  /** `sm` para linhas compactas (lista admin). */
  size?: "sm" | "md";
};

export function StackChips({ stacks, size = "md" }: Props) {
  const safeStacks = Array.isArray(stacks) ? stacks : [];
  const iconCls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textCls =
    size === "sm"
      ? "text-[10px] leading-tight"
      : "text-xs md:text-sm";

  return (
    <ul className="flex flex-wrap gap-2">
      {safeStacks.map((raw, i) => {
        const { label, Icon } = resolveStack(raw);
        return (
          <li
            key={`${i}-${raw}`}
            className={`inline-flex items-center gap-1.5 rounded-md border border-rune/30 bg-ink-900/55 px-2 py-1 font-body ${textCls} text-parchment`}
          >
            <Icon className={`${iconCls} shrink-0 text-rune`} aria-hidden />
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
