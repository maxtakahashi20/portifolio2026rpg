import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiUrl } from "../api/client";
import { ADMIN_LOGIN_ROUTE } from "../config/admin";
import type { PortfolioProjectRecord } from "../game/types";
import {
  formatStackLabel,
  normalizeStackToken,
  resolveStack,
} from "../data/techStacks";
import { StackChips } from "../ui/StackChips";
import {
  clearStoredAdminSecret,
  getStoredAdminSecret,
} from "./adminSession";
import { StackPickerModal } from "./StackPickerModal";

export function AdminProjectsPage() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearStoredAdminSecret();
    navigate(ADMIN_LOGIN_ROUTE, { replace: true });
  }, [navigate]);

  if (!getStoredAdminSecret()) {
    return <Navigate to={ADMIN_LOGIN_ROUTE} replace />;
  }

  return <AdminDashboard onLogout={logout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [projects, setProjects] = useState<PortfolioProjectRecord[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stackTokens, setStackTokens] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const secretHeader = (): HeadersInit => ({
    "Content-Type": "application/json",
    "X-Admin-Secret": getStoredAdminSecret(),
  });

  const refresh = useCallback(async () => {
    setListError(null);
    setLoadingList(true);
    try {
      const r = await fetch(apiUrl("/api/projects"));
      if (!r.ok) throw new Error();
      const data = (await r.json()) as PortfolioProjectRecord[];
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setListError("Não foi possível carregar os projetos.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setStackTokens([]);
    setPickerOpen(false);
    setSiteUrl("");
    setRepoUrl("");
    setFormError(null);
  };

  const loadIntoForm = (p: PortfolioProjectRecord) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description);
    setStackTokens((Array.isArray(p.stacks) ? p.stacks : []).map((s) => normalizeStackToken(s)));
    setSiteUrl(p.siteUrl ?? "");
    setRepoUrl(p.repoUrl ?? "");
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    const stacks = stackTokens.filter(Boolean);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      stacks,
      siteUrl: siteUrl.trim(),
      repoUrl: repoUrl.trim(),
    };

    if (!payload.name || !payload.description) {
      setFormError("Nome e descrição são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const url =
        editingId === null
          ? apiUrl("/api/projects")
          : apiUrl(`/api/projects/${editingId}`);
      const method = editingId === null ? "POST" : "PUT";
      const r = await fetch(url, {
        method,
        headers: secretHeader(),
        body: JSON.stringify(payload),
      });
      const body = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setFormError(body.error ?? "Falha ao salvar.");
        return;
      }
      resetForm();
      await refresh();
    } catch {
      setFormError("Erro de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string, displayName: string) => {
    if (
      !window.confirm(
        `Excluir o projeto "${displayName}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const r = await fetch(apiUrl(`/api/projects/${id}`), {
        method: "DELETE",
        headers: { "X-Admin-Secret": getStoredAdminSecret() },
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        window.alert(body.error ?? "Falha ao excluir.");
        return;
      }
      if (editingId === id) resetForm();
      await refresh();
    } catch {
      window.alert("Erro de rede ao excluir.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCatalogId = (id: string) => {
    setStackTokens((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const addCustomStack = (label: string) => {
    const t = label.trim();
    if (!t || stackTokens.includes(t)) return;
    setStackTokens((prev) => [...prev, t]);
  };

  const removeStackToken = (token: string) => {
    setStackTokens((prev) => prev.filter((x) => x !== token));
  };

  return (
    <div className="min-h-screen select-text bg-ink-900 bg-twilight-radial px-4 py-10 text-parchment">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-rune/25 pb-6">
          <div>
            <h1 className="font-rune text-3xl text-rune text-shadow-rune">
              Projetos
            </h1>
            <p className="mt-2 font-display text-xs uppercase tracking-[0.35em] text-parchment-dark">
              criar · editar · excluir · API REST
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-rune/35 px-4 py-2 font-display text-xs uppercase tracking-wider text-parchment hover:border-rune hover:text-rune"
            >
              Novo
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-rune/25 px-4 py-2 font-display text-xs uppercase tracking-wider text-parchment-dark hover:border-ember hover:text-ember"
            >
              Sair
            </button>
            <Link
              to="/"
              className="rounded-lg border border-rune/35 px-4 py-2 font-display text-xs uppercase tracking-wider text-parchment hover:border-rune hover:text-rune"
            >
              Portfólio
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
          <section className="panel-frame min-w-0 px-6 py-6">
            <h2 className="font-display text-sm uppercase tracking-[0.35em] text-rune">
              {editingId ? "Editar" : "Adicionar"}
            </h2>
            <label className="mt-5 block font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
              Nome
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm outline-none ring-rune/35 focus:ring-2"
            />
            <label className="mt-4 block font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full resize-y rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm outline-none ring-rune/35 focus:ring-2"
            />
            <label className="mt-4 block font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
              Stacks
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {stackTokens.map((tok) => {
                const { Icon } = resolveStack(tok);
                return (
                  <span
                    key={tok}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rune/35 bg-ink-900/60 px-2 py-1 font-body text-xs text-parchment"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-rune" aria-hidden />
                    <span>{formatStackLabel(tok)}</span>
                    <button
                      type="button"
                      className="ml-0.5 rounded px-1 font-rune text-rune hover:bg-rune/15"
                      aria-label={`Remover ${formatStackLabel(tok)}`}
                      onClick={() => removeStackToken(tok)}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-3 w-full rounded-lg border border-rune/35 bg-ink-900/50 py-2 font-display text-xs uppercase tracking-wider text-parchment hover:border-rune hover:text-rune"
            >
              Escolher tecnologias…
            </button>
            <label className="mt-4 block font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
              URL do site
            </label>
            <input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm outline-none ring-rune/35 focus:ring-2"
            />
            <label className="mt-4 block font-display text-[10px] uppercase tracking-[0.25em] text-parchment-dark">
              URL do repositório
            </label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="mt-1 w-full rounded-lg border border-rune/30 bg-ink-900/70 px-3 py-2 font-body text-sm outline-none ring-rune/35 focus:ring-2"
            />

            {formError && (
              <p className="mt-4 font-body text-sm text-ember">{formError}</p>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={submit}
              className="rune-button mt-6 w-full justify-center py-3 text-sm disabled:opacity-50"
            >
              {saving ? "Salvando…" : editingId ? "Atualizar (PUT)" : "Criar (POST)"}
            </button>

            <StackPickerModal
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              stackTokens={stackTokens}
              onToggleCatalogId={toggleCatalogId}
              onAddCustom={addCustomStack}
            />
          </section>

          <section className="panel-frame min-w-0 px-6 py-6">
            <h2 className="font-display text-sm uppercase tracking-[0.35em] text-rune">
              Cadastrados (GET)
            </h2>
            {loadingList && (
              <p className="mt-6 font-body text-sm text-parchment-dark">Carregando…</p>
            )}
            {listError && (
              <p className="mt-6 font-body text-sm text-ember">{listError}</p>
            )}
            {!loadingList && !listError && projects.length === 0 && (
              <p className="mt-6 font-body text-sm text-parchment-dark">
                Nenhum projeto ainda. Use o formulário ao lado.
              </p>
            )}
            <ul className="mt-6 space-y-3">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-lg border border-rune/25 bg-ink-900/35"
                >
                  <div className="flex gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => loadIntoForm(p)}
                      className={[
                        "min-w-0 flex-1 rounded-lg border px-4 py-3 text-left transition-colors",
                        editingId === p.id
                          ? "border-rune bg-ink-900/70 text-rune"
                          : "border-transparent hover:border-rune/35 hover:bg-ink-900/50",
                      ].join(" ")}
                    >
                      <span className="font-rune text-lg text-parchment">{p.name}</span>
                      <span className="mt-1 block line-clamp-2 font-body text-xs text-parchment-dark">
                        {p.description}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={(e) => {
                        e.preventDefault();
                        void deleteProject(p.id, p.name);
                      }}
                      className="shrink-0 self-start rounded-lg border border-ember/40 px-3 py-2 font-display text-[10px] uppercase tracking-wider text-ember hover:bg-ember/10 disabled:opacity-40"
                    >
                      {deletingId === p.id ? "…" : "Excluir"}
                    </button>
                  </div>
                  <div className="border-t border-rune/15 px-3 pb-3 pt-2">
                    <StackChips stacks={p.stacks} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
