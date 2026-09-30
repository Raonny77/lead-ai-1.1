import { count, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/db";
import { analises, leads } from "@/db/schema";
import AnalisarButton from "@/components/AnalisarButton";
import CopyButton from "@/components/CopyButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel | Lead AI", robots: { index: false, follow: false } };

const FILTROS = ["quente", "morno", "frio"] as const;
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function Painel({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  if (!(await getSession())) redirect("/login"); // defesa em profundidade além do proxy
  const { c } = await searchParams;
  const filtro = FILTROS.find((f) => f === c);
  const db = getDb();

  // Filtro e contagens no banco: antes eram calculados só sobre os 200 primeiros leads.
  const [visiveis, porClasse, [{ total }]] = await Promise.all([
    db
      .select({ lead: leads, analise: analises })
      .from(leads)
      .leftJoin(analises, eq(analises.leadId, leads.id))
      .where(filtro ? eq(analises.classificacao, filtro) : undefined)
      .orderBy(sql`${analises.score} desc nulls last`, desc(leads.criadoEm))
      .limit(200),
    db.select({ c: analises.classificacao, n: count() }).from(analises).groupBy(analises.classificacao),
    db.select({ total: count() }).from(leads),
  ]);
  const contagem = (k: string) => porClasse.find((x) => x.c === k)?.n ?? 0;

  return (
    <div className="pagina-painel">
      <div className="painel-topo">
        <h1>Leads</h1>
        <form action="/api/auth/logout" method="post"><button type="submit" className="btn-sec">Sair</button></form>
        <nav className="filtros" aria-label="Filtrar por classificação">
          <Link href="/painel" aria-current={!filtro ? "page" : undefined}>Todos ({total})</Link>
          {FILTROS.map((f) => (
            <Link key={f} href={`/painel?c=${f}`} aria-current={filtro === f ? "page" : undefined} className={f}>
              {f[0].toUpperCase() + f.slice(1)} ({contagem(f)})
            </Link>
          ))}
        </nav>
      </div>

      {visiveis.length === 0 ? (
        <p className="vazio">
          {total === 0
            ? "Nenhum lead ainda. Envie uma mensagem pelo formulário para ver a análise aqui."
            : "Nenhum lead nesta classificação."}
        </p>
      ) : (
        <ul className="lista">
          {visiveis.map(({ lead, analise }) => (
            <li key={lead.id}>
              <details className={`lead ${analise?.classificacao ?? "pendente"}`}>
                <summary>
                  <span className="nota">{analise?.score ?? "–"}</span>
                  <span className="quem">
                    <strong>{lead.nome}</strong>
                    <span>{lead.empresa}{lead.cargo ? `, ${lead.cargo}` : ""}</span>
                  </span>
                  <span className="tag">{analise?.classificacao ?? "sem análise"}</span>
                  <time dateTime={lead.criadoEm.toISOString()}>{data.format(lead.criadoEm)}</time>
                </summary>

                <div className="detalhe">
                  <section>
                    <h2>Mensagem do lead</h2>
                    <p className="texto">{lead.mensagem}</p>
                    <dl>
                      <dt>E-mail</dt><dd>{lead.email}</dd>
                      {lead.telefone && (<><dt>Telefone</dt><dd>{lead.telefone}</dd></>)}
                      <dt>Orçamento</dt><dd>{lead.orcamento}</dd>
                      <dt>Prazo</dt><dd>{lead.prazo}</dd>
                    </dl>
                  </section>

                  <section>
                    {analise ? (
                      <>
                        <h2>Por que essa nota</h2>
                        <p>{analise.justificativa}</p>
                        <h2>Resposta sugerida</h2>
                        <p className="texto resposta">{analise.respostaSugerida}</p>
                        <div className="acoes">
                          <CopyButton texto={analise.respostaSugerida} />
                          <a
                            className="btn-sec"
                            href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Sobre a sua mensagem")}&body=${encodeURIComponent(analise.respostaSugerida)}`}
                          >
                            Abrir no e-mail
                          </a>
                          <AnalisarButton leadId={lead.id} rotulo="Reanalisar" />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2>Sem análise</h2>
                        <p>A análise falhou ou ainda não rodou para este lead.</p>
                        <div className="acoes"><AnalisarButton leadId={lead.id} rotulo="Analisar agora" /></div>
                      </>
                    )}
                  </section>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
