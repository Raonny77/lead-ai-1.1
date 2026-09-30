import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { analisarESalvar } from "@/lib/analyze";
import { clienteId, fail, lerJson } from "@/lib/http";
import { hit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation";

export const maxDuration = 30;

export async function POST(req: Request) {
  // CSRF/abuso cross-site: se o navegador mandou Origin, ele precisa ser o nosso host.
  const origin = req.headers.get("origin");
  if (origin) {
    let host = "";
    try { host = new URL(origin).host; } catch { /* inválido */ }
    if (host !== (req.headers.get("x-forwarded-host") ?? req.headers.get("host"))) return fail(403, "Origem não permitida");
  }

  try {
    // A04: cada envio custa uma chamada paga à Claude API. Limita por visitante e no total.
    const porIp = await hit(`lead:${clienteId(req)}`, 5, 10 * 60);
    const global = await hit("lead:global", 300, 60 * 60);
    if (!porIp.ok || !global.ok) {
      return fail(429, "Muitos envios. Tente novamente em alguns minutos.", {}, { "Retry-After": String(porIp.ok ? global.retryAfter : porIp.retryAfter) });
    }

    let corpo: unknown;
    try {
      corpo = await lerJson(req, 10_000);
    } catch (e) {
      return fail(e instanceof RangeError ? 413 : 400, e instanceof RangeError ? "Mensagem grande demais" : "JSON inválido");
    }

    const parsed = leadSchema.safeParse(corpo);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
      return fail(422, "Verifique os campos destacados", { fields });
    }

    const { website, ...dados } = parsed.data;
    if (website) return NextResponse.json({ success: true, data: null, error: null }); // bot: finge sucesso

    // 1) Salva o lead primeiro: ele nunca se perde se a IA falhar.
    const [lead] = await getDb()
      .insert(leads)
      .values({ ...dados, telefone: dados.telefone || null, cargo: dados.cargo || null })
      .returning();

    // 2) Analisa. Falha aqui não derruba o envio; o painel oferece "Analisar".
    try {
      await analisarESalvar(lead);
    } catch (erro) {
      console.error("Falha na análise do lead", lead.id, erro instanceof Error ? erro.message : "erro");
    }

    return NextResponse.json({ success: true, data: { id: lead.id }, error: null }, { status: 201 });
  } catch (erro) {
    console.error("Falha ao registrar lead", erro instanceof Error ? erro.message : "erro");
    return fail(500, "Não foi possível enviar agora. Tente novamente.");
  }
}
