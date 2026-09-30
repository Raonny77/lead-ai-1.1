import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar | Lead AI", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await getSession()) redirect("/painel");
  return (
    <div className="pagina-form">
      <section className="intro">
        <h1>Painel do vendedor</h1>
        <p>Acesso restrito. Entre com suas credenciais.</p>
      </section>
      <LoginForm />
    </div>
  );
}
