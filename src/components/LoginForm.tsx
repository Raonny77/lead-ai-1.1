"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (enviando) return;
    const f = new FormData(ev.currentTarget);
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: String(f.get("usuario") ?? ""), senha: String(f.get("senha") ?? "") }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setErro(json?.error ?? "Não foi possível entrar. Tente novamente.");
        return;
      }
      router.replace("/painel");
      router.refresh();
    } catch {
      setErro("Sem conexão. Verifique sua internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="form" noValidate>
      <div className="campo">
        <label htmlFor="usuario">Usuário</label>
        <input id="usuario" name="usuario" autoComplete="username" maxLength={100} required />
      </div>
      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" maxLength={200} required />
      </div>
      {erro && <p className="erro-form" role="alert">{erro}</p>}
      <button type="submit" className="btn" disabled={enviando}>{enviando ? "Entrando" : "Entrar"}</button>
    </form>
  );
}
