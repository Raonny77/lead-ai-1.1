import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export function fail(status: number, error: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ success: false, data: null, error, ...extra }, { status, headers });
}

// CSRF: exige que Origin seja o proprio host (alem do cookie SameSite=Strict).
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

// IP ja vem sobrescrito pela Vercel (nao forjavel pelo cliente). Guardamos so um hash (LGPD).
export function clienteId(req: Request) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  return createHash("sha256").update(ip + (process.env.JWT_SECRET ?? "")).digest("hex").slice(0, 32);
}

// Le JSON com limite de tamanho (evita corpo gigante).
export async function lerJson(req: Request, maxBytes = 10_000): Promise<unknown> {
  const texto = await req.text();
  if (texto.length > maxBytes) throw new RangeError("payload");
  return JSON.parse(texto);
}
