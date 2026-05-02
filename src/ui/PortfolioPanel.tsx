import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "../api/client";
import { StackChips } from "./StackChips";
import type {
  PortfolioProject,
  PortfolioProjectRecord,
  PortfolioSection,
} from "../game/types";

type Props = {
  section: PortfolioSection | null;
  onClose: () => void;
};

/**
 * Modal panel that shows a portfolio section. Replaces the original single
 * `#card` element + innerHTML approach with a typed React renderer.
 */
export function PortfolioPanel({ section, onClose }: Props) {
  /** `undefined` = ainda não carregou · `null` = erro ao buscar */
  const [remoteProjects, setRemoteProjects] = useState<
    PortfolioProjectRecord[] | undefined | null
  >(undefined);
  const [projError, setProjError] = useState(false);

  useEffect(() => {
    if (!section || section.id !== "projetos") {
      setRemoteProjects(undefined);
      setProjError(false);
      return;
    }

    let cancelled = false;
    setRemoteProjects(undefined);
    setProjError(false);

    fetch(apiUrl("/api/projects"))
      .then(async (r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json() as Promise<PortfolioProjectRecord[]>;
      })
      .then((data) => {
        if (cancelled) return;
        setRemoteProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setProjError(true);
          setRemoteProjects(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [section?.id]);

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key="panel-backdrop"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink-900/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key={`panel-${section.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={section.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="panel-frame relative mx-4 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden"
          >
            <Header section={section} onClose={onClose} />

            <div className="scrollbar-none overflow-y-auto px-7 py-6 text-parchment">
              <div className="space-y-5">
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}

                {section.id === "projetos" && (
                  <div className="space-y-4">
                    {!projError && remoteProjects === undefined && (
                      <p className="font-body text-sm text-parchment-dark">
                        Carregando projetos…
                      </p>
                    )}
                    {projError && (
                      <p className="font-body text-sm text-ember">
                        Não foi possível carregar os projetos. Verifique se o
                        servidor da API está rodando.
                      </p>
                    )}
                    {!projError &&
                      Array.isArray(remoteProjects) &&
                      remoteProjects.length === 0 && (
                        <p className="font-body text-sm text-parchment-dark">
                          Nenhum projeto publicado ainda.
                        </p>
                      )}
                    {!projError &&
                      Array.isArray(remoteProjects) &&
                      remoteProjects.length > 0 && (
                        <div className="space-y-5 pt-1">
                          {remoteProjects.map((p) => (
                            <ProjectCard key={p.id} project={p} />
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            <FooterRunes />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({
  section,
  onClose,
}: {
  section: PortfolioSection;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-rune/20 px-7 pb-4 pt-6">
      <div className="flex items-center gap-4">
        <span className="font-rune text-4xl text-rune text-shadow-rune">
          {section.rune}
        </span>
        <div>
          <h2 className="font-rune text-3xl text-parchment text-shadow-rune">
            {section.title}
          </h2>
          <p className="mt-1 font-display text-xs uppercase tracking-[0.35em] text-parchment-dark">
            {section.subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Fechar painel"
        className="rune-button h-10 w-10 px-0 py-0 text-xl"
      >
        ✕
      </button>
    </div>
  );
}

function Block({ block }: { block: PortfolioSection["body"][number] }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-lg leading-relaxed text-parchment/90">
          {block.text}
        </p>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-rune/60 bg-ink-900/40 px-4 py-3 italic text-parchment">
          <p className="text-base leading-relaxed">"{block.text}"</p>
          {block.author && (
            <footer className="mt-2 font-display text-xs uppercase tracking-[0.3em] text-parchment-dark">
              — {block.author}
            </footer>
          )}
        </blockquote>
      );
    case "list":
      return (
        <div>
          <h3 className="mb-2 font-display text-sm uppercase tracking-[0.35em] text-rune text-shadow-rune">
            {block.label}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {block.items.map((it) => (
              <li
                key={it}
                className="rounded-md border border-rune/30 bg-ink-900/50 px-3 py-1 font-body text-sm text-parchment"
              >
                {it}
              </li>
            ))}
          </ul>
        </div>
      );
    case "links":
      return (
        <ul className="grid gap-2 sm:grid-cols-2">
          {block.items.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target={l.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-md border border-rune/30 bg-ink-900/50 px-3 py-2 transition-colors hover:border-rune hover:text-rune"
              >
                {l.glyph && (
                  <span className="font-rune text-xl text-rune text-shadow-rune">
                    {l.glyph}
                  </span>
                )}
                <span className="font-body text-sm">{l.label}</span>
                <span className="ml-auto text-rune opacity-0 transition-opacity group-hover:opacity-100">
                  ›
                </span>
              </a>
            </li>
          ))}
        </ul>
      );
    case "projects":
      return (
        <div className="space-y-5">
          {block.items.map((p, i) => (
            <ProjectCard key={`${p.name}-${i}`} project={p} />
          ))}
        </div>
      );
  }
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  const { name, description, stacks, siteUrl, repoUrl } = project;
  const hasLinks = Boolean(siteUrl?.trim()) || Boolean(repoUrl?.trim());

  return (
    <article className="rounded-xl border border-rune/25 bg-ink-900/35 px-5 py-4 shadow-inner shadow-black/20">
      <h3 className="font-rune text-xl text-parchment text-shadow-rune md:text-2xl">
        {name}
      </h3>
      <p className="mt-2 text-base leading-relaxed text-parchment/85">
        {description}
      </p>

      <div className="mt-4">
        <p className="mb-2 font-display text-[10px] uppercase tracking-[0.35em] text-rune text-shadow-rune">
          Stack
        </p>
        <StackChips stacks={stacks} size="md" />
      </div>

      {hasLinks && (
        <div className="mt-4 flex flex-wrap gap-2">
          {siteUrl?.trim() && (
            <a
              href={siteUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="rune-button inline-flex items-center gap-2 px-4 py-2 font-display text-xs uppercase tracking-[0.2em]"
            >
              <span aria-hidden>◇</span>
              Ver site
            </a>
          )}
          {repoUrl?.trim() && (
            <a
              href={repoUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-rune/35 bg-ink-900/60 px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-parchment transition-colors hover:border-rune hover:text-rune"
            >
              <span aria-hidden>⌥</span>
              Repositório
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function FooterRunes() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-6 border-t border-rune/15 bg-ink-900/30 py-2 font-rune text-rune/40"
    >
      <span>✦</span>
      <span>✷</span>
      <span>❖</span>
      <span>⌬</span>
      <span>✺</span>
    </div>
  );
}
