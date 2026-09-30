import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { analisarESalvar } from "@/lib/analyze";
import { getSession } from "@/lib/auth";
import { fail, sameOrigin } from "@/lib/http";
import { hit } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Revalida a sessão aqui também: não depende só do proxy.
  const sessao = await getSession();
  if (!sessao) return fail(401, "Não autenticado");
  if (!sameOrigin(req)) return fail(403, "Origem não permitida");

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return fail(400, "ID inválido");

  try {
    const limite = await hit(`analisar:${sessao.sub}`, 30, 60);
    if (!limite.ok) return fail(429, "Muitas análises seguidas. Aguarde um pouco.", {}, { "Retry-After": String(limite.retryAfter) });

    const [lead] = await getDb().select().from(leads).where(eq(leads.id, id));
    if (!lead) return fail(404, "Lead não encontrado");

    const analise = await analisarESalvar(lead);
    return NextResponse.json({ success: true, data: analise, error: null });
  } catch (erro) {
    console.error("Falha ao analisar", id, erro instanceof Error ? erro.message : "erro");
    return fail(502, "Não foi possível analisar agora. Tente de novo.");
  }
}
