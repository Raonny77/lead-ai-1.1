import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE, credenciaisValidas, criarToken, SESSION_SECONDS } from "@/lib/auth";
import { clienteId, fail, lerJson, sameOrigin } from "@/lib/http";
import { clear, hit } from "@/lib/rate-limit";

const MAX_TENTATIVAS = 5;
const JANELA = 15 * 60; // 15 min de bloqueio após 5 tentativas

const schema = z.object({ usuario: z.string().max(100), senha: z.string().max(200) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Origem não permitida");

  try {
    const chave = `login:${clienteId(req)}`;
    const limite = await hit(chave, MAX_TENTATIVAS, JANELA);
    if (!limite.ok) {
      return fail(429, "Muitas tentativas. Tente novamente mais tarde.", {}, { "Retry-After": String(limite.retryAfter) });
    }

    const corpo = schema.safeParse(await lerJson(req, 1000).catch(() => null));
    if (!corpo.success || !credenciaisValidas(corpo.data.usuario, corpo.data.senha)) {
      return fail(401, "Usuário ou senha inválidos"); // mensagem única: não revela qual campo errou
    }

    await clear(chave);
    const res = NextResponse.json({ success: true, data: null, error: null });
    res.cookies.set(COOKIE, await criarToken(corpo.data.usuario), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    return res;
  } catch (erro) {
    console.error("Falha no login", erro instanceof Error ? erro.message : "erro");
    return fail(500, "Erro interno. Tente novamente.");
  }
}
