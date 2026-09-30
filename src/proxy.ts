import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verificarToken } from "@/lib/auth";

// Primeira barreira. As rotas/paginas protegidas TAMBEM revalidam a sessao (defesa em profundidade).
export async function proxy(req: NextRequest) {
  const sessao = await verificarToken(req.cookies.get(COOKIE)?.value);
  if (sessao) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, data: null, error: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/painel/:path*", "/api/leads/:path+"] };
