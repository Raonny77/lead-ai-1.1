"use client";

import { useEffect, useRef, useState } from "react";

export default function CopyButton({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("ok");
    } catch {
      setEstado("erro"); // sem permissão ou contexto não seguro
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("idle"), 2000);
  }

  return (
    <button type="button" className="btn-sec" onClick={copiar}>
      {estado === "ok" ? "Copiado" : estado === "erro" ? "Não foi possível copiar" : "Copiar resposta"}
    </button>
  );
}
