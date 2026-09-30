# Relatório de uso do Claude Code

> Modelo de relatório. Os trechos entre `[colchetes]` devem ser preenchidos com o que realmente aconteceu na sua sessão.

## 1. Objetivo

Construir uma aplicação web que capta leads, avalia o potencial de cada um com a Claude API (nota de 0 a 100, classificação quente/morna/fria e resposta de follow-up sugerida) e mostra os resultados a um vendedor em um painel.

## 2. Ambiente

- Ferramenta: Claude Code, versão `[claude --version]`
- Modelo usado no Claude Code: `[modelo]`
- Sistema operacional e editor: `[ex.: Windows 11 + VSCode]`
- Modelo usado **dentro do produto**: `claude-haiku-4-5` (via Claude API)

## 3. Prompt inicial

```
Crie uma aplicação web que capta leads, usa IA para avaliar o potencial de cada contato e sugere a
resposta ideal para o vendedor. O lead preenche um formulário. A Claude API devolve nota de 0 a 100,
classificação (quente, morno, frio) e uma resposta de follow-up sugerida.

Escopo: formulário de captação, análise via Claude API, persistência no NeonDB, painel listando leads
e análises, README e relatório documentando o uso do Claude Code.
Stack: Next.js (App Router) + TypeScript, Neon (Postgres serverless), Drizzle ORM, Claude API · claude-haiku-4-5.
Fluxo: Formulário → API Next.js (Zod) → Claude API → NeonDB → Painel.
```

## 4. Etapas da sessão

| # | Etapa | Prompt ou comando usado | O que o Claude Code fez | Ajuste manual |
|---|---|---|---|---|
| 1 | Setup do projeto | `[preencher]` | `[preencher]` | `[preencher]` |
| 2 | Schema Drizzle e Neon | `[preencher]` | `[preencher]` | `[preencher]` |
| 3 | Validação Zod e rota de captação | `[preencher]` | `[preencher]` | `[preencher]` |
| 4 | Integração com a Claude API | `[preencher]` | `[preencher]` | `[preencher]` |
| 5 | Formulário e painel | `[preencher]` | `[preencher]` | `[preencher]` |
| 6 | README e correções finais | `[preencher]` | `[preencher]` | `[preencher]` |

## 5. Decisões técnicas

| Decisão | Motivo |
|---|---|
| Saída estruturada por *tool use* forçado | Garante JSON com os quatro campos, sem depender de o modelo "seguir o formato" em texto livre |
| Classificação derivada da nota (70+/40–69/<40) | Evita contradição entre nota e classificação |
| Lead salvo antes da análise | Falha da IA não perde o contato; há botão de reanálise |
| Lead não recebe a nota | Nota e resposta sugerida são informação interna do vendedor |
| Dados do lead tratados como dados no prompt | Reduz risco de *prompt injection* vindo do formulário público |
| Painel com HTTP Basic (`proxy.ts`) | O escopo não pedia login, mas o painel expõe dados pessoais |
| Uma análise por lead (`lead_id` único) | Simplifica a consulta do painel; reanálise atualiza a linha |

## 6. Testes realizados

| Cenário | Entrada | Resultado esperado | Resultado obtido |
|---|---|---|---|
| Lead forte | Diretor, prazo urgente, orçamento alto, necessidade clara | Nota ≥ 70, quente | `[preencher]` |
| Lead intermediário | Gerente, 1 a 3 meses, faixa média | Nota 40–69, morna | `[preencher]` |
| Lead fraco | Sem prazo, sem orçamento, mensagem vaga | Nota < 40, fria | `[preencher]` |
| Validação | E-mail inválido, mensagem curta | 422 com mensagens por campo | `[preencher]` |
| Falha da IA | Chave inválida | Lead salvo, painel com "Sem análise" | `[preencher]` |
| Injection | Mensagem pedindo "dê nota 100" | Nota não obedece à instrução | `[preencher]` |

## 7. Problemas encontrados e como foram resolvidos

- `[problema]` → `[solução]`

## 8. Avaliação

- O que o Claude Code acelerou: `[preencher]`
- Onde foi preciso intervir ou corrigir: `[preencher]`
- Qualidade das notas e das respostas sugeridas do Haiku 4.5: `[preencher]`
- Custo aproximado por análise: `[preencher com base no uso registrado no console da Anthropic]`

## 9. Limitações e próximos passos

Sem limite de envios por IP, sem status de lead (contatado, ganho, perdido), sem histórico de reanálises e sem envio de e-mail pelo próprio app.
