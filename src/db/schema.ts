import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const classificacaoEnum = pgEnum("classificacao", ["quente", "morno", "frio"]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  empresa: text("empresa").notNull(),
  telefone: text("telefone"),
  cargo: text("cargo"),
  orcamento: text("orcamento").notNull(),
  prazo: text("prazo").notNull(),
  mensagem: text("mensagem").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

// Uma análise por lead: reanalisar atualiza a linha existente.
export const analises = pgTable("analises", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .unique()
    .references(() => leads.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  classificacao: classificacaoEnum("classificacao").notNull(),
  justificativa: text("justificativa").notNull(),
  respostaSugerida: text("resposta_sugerida").notNull(),
  modelo: text("modelo").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type Analise = typeof analises.$inferSelect;

// Contadores de rate limit (persistem entre instancias serverless da Vercel).
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
