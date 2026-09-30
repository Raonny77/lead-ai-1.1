"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ORCAMENTOS, PRAZOS } from "@/lib/validation";

type Estado = {
  status: "idle" | "enviando" | "ok" | "erro";
  erro?: string;
  campos?: Record<string, string>;
};

function Campo({ nome, rotulo, erro, children }: { nome: string; rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <div className="campo">
      <label htmlFor={nome}>{rotulo}</label>
      {children}
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
    </div>
  );
}

export default function LeadForm() {
  const [estado, setEstado] = useState<Estado>({ status: "idle" });
  const e = estado.campos ?? {};

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (estado.status === "enviando") return; // evita envio duplicado
    const form = ev.currentTarget;
    setEstado({ status: "enviando" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const erro = json?.error ?? (res.status === 429 ? "Muitos envios. Tente novamente em alguns minutos." : "Não foi possível enviar agora. Tente novamente.");
        return setEstado({ status: "erro", erro, campos: json?.fields });
      }
      form.reset();
      setEstado({ status: "ok" });
    } catch {
      setEstado({ status: "erro", erro: "Não foi possível enviar. Verifique sua conexão e tente de novo." });
    }
  }

  if (estado.status === "ok") {
    return (
      <div className="confirmacao" role="status">
        <h2>Mensagem enviada</h2>
        <p>Nosso time comercial vai responder no e-mail informado.</p>
        <button type="button" className="btn-sec" onClick={() => setEstado({ status: "idle" })}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="form" noValidate>
      <div className="grade">
        <Campo nome="nome" rotulo="Nome" erro={e.nome}>
          <input id="nome" name="nome" maxLength={120} autoComplete="name" required />
        </Campo>
        <Campo nome="email" rotulo="E-mail" erro={e.email}>
          <input id="email" name="email" maxLength={200} type="email" autoComplete="email" required />
        </Campo>
        <Campo nome="empresa" rotulo="Empresa" erro={e.empresa}>
          <input id="empresa" name="empresa" maxLength={160} autoComplete="organization" required />
        </Campo>
        <Campo nome="cargo" rotulo="Cargo (opcional)" erro={e.cargo}>
          <input id="cargo" name="cargo" maxLength={100} autoComplete="organization-title" />
        </Campo>
        <Campo nome="telefone" rotulo="Telefone (opcional)" erro={e.telefone}>
          <input id="telefone" name="telefone" maxLength={30} type="tel" autoComplete="tel" />
        </Campo>
        <Campo nome="orcamento" rotulo="Orçamento previsto" erro={e.orcamento}>
          <select id="orcamento" name="orcamento" defaultValue={ORCAMENTOS[0]}>
            {ORCAMENTOS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Campo>
        <Campo nome="prazo" rotulo="Prazo para decidir" erro={e.prazo}>
          <select id="prazo" name="prazo" defaultValue={PRAZOS[0]}>
            {PRAZOS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Campo>
      </div>

      <Campo nome="mensagem" rotulo="O que você precisa resolver?" erro={e.mensagem}>
        <textarea id="mensagem" name="mensagem" rows={5} maxLength={2000} required />
      </Campo>

      {/* Honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="isca" />

      {estado.status === "erro" && estado.erro && <p className="erro-form" role="alert">{estado.erro}</p>}

      <button type="submit" className="btn" disabled={estado.status === "enviando"}>
        {estado.status === "enviando" ? "Enviando" : "Enviar mensagem"}
      </button>
    </form>
  );
}
