import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const PROD = process.env.NODE_ENV === "production";
export const COOKIE = PROD ? "__Host-lead_session" : "lead_session";
export const SESSION_SECONDS = 8 * 60 * 60;
const ISS = "lead-ai";
const AUD = "painel";

function segredo() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET ausente ou com menos de 32 caracteres");
  return new TextEncoder().encode(s);
}

export async function criarToken(usuario: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario)
    .setIssuer(ISS)
    .setAudience(AUD)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(segredo());
}

// Algoritmo fixado em HS256 (bloqueia alg=none e confusão de algoritmo); valida iss, aud e exp.
export async function verificarToken(token?: string) {
  if (!token) return null;
  const chave = segredo();
  try {
    return (await jwtVerify(token, chave, { algorithms: ["HS256"], issuer: ISS, audience: AUD })).payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  return verificarToken((await cookies()).get(COOKIE)?.value);
}

const h = (s: string) => createHash("sha256").update(s).digest();

// Comparação em tempo constante, sem curto-circuito entre usuário e senha.
export function credenciaisValidas(usuario: string, senha: string) {
  const u = process.env.PAINEL_USER;
  const p = process.env.PAINEL_PASSWORD;
  if (!u || !p) return false;
  const a = timingSafeEqual(h(usuario), h(u));
  const b = timingSafeEqual(h(senha), h(p));
  return a && b;
}
