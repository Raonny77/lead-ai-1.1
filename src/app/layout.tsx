import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fonte = Schibsted_Grotesk({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Lead AI",
  description: "Captação de leads com análise de potencial e resposta sugerida por IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={fonte.className}>
        <header className="topo">
          <Link href="/" className="marca">Lead AI</Link>
          <nav>
            <Link href="/">Fale conosco</Link>
            <Link href="/painel">Painel do vendedor</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
