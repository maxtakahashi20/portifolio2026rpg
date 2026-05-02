import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_PROJECTS_ROUTE } from "../config/admin";
import {
  getStoredAdminSecret,
  setStoredAdminSecret,
} from "./adminSession";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [secretDraft, setSecretDraft] = useState("");

  useEffect(() => {
    if (getStoredAdminSecret()) {
      navigate(ADMIN_PROJECTS_ROUTE, { replace: true });
    }
  }, [navigate]);

  const unlock = () => {
    const s = secretDraft.trim();
    if (!s) return;
    setStoredAdminSecret(s);
    setSecretDraft("");
    navigate(ADMIN_PROJECTS_ROUTE, { replace: true });
  };

  return (
    <div className="flex min-h-screen select-text flex-col items-center justify-center bg-ink-900 bg-twilight-radial px-4 py-16 text-parchment">
      <div className="panel-frame w-full max-w-md px-8 py-10">
        <h1 className="font-rune text-2xl text-rune text-shadow-rune">
          Admin
        </h1>
        <p className="mt-3 font-body text-sm text-parchment/75">
          Esta página é pública; informe o segredo configurado como{" "}
          <code className="rounded bg-ink-900/80 px-1 font-mono text-xs text-rune">
            ADMIN_SECRET
          </code>{" "}
          no servidor para abrir o painel de projetos.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={secretDraft}
          onChange={(e) => setSecretDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
          className="mt-6 w-full rounded-lg border border-rune/35 bg-ink-900/70 px-3 py-2 font-body text-sm text-parchment outline-none ring-rune/40 focus:ring-2"
          placeholder="Segredo administrativo"
        />
        <button
          type="button"
          onClick={unlock}
          className="rune-button mt-5 w-full justify-center py-3 text-sm"
        >
          Entrar no painel de projetos
        </button>
        <Link
          to="/"
          className="mt-8 block text-center font-display text-xs uppercase tracking-[0.25em] text-parchment-dark hover:text-rune"
        >
          ← Voltar ao portfólio
        </Link>
      </div>
    </div>
  );
}
