"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AnalisarButton({ leadId, rotulo }: { leadId: string; rotulo: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function analisar() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/analisar`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (res.status === 401) return router.replace("/login"); // sessão expirou
      if (!res.ok) throw new Error(json?.error ?? "Não foi possível analisar agora.");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao analisar");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <span className="acao">
      <button type="button" className="btn-sec" onClick={analisar} disabled={carregando}>
        {carregando ? "Analisando" : rotulo}
      </button>
      {erro && <span className="erro-campo" role="alert">{erro}</span>}
    </span>
  );
}
