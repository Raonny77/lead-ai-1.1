import { z } from "zod";

export const ORCAMENTOS = [
  "Ainda não definido",
  "Até R$ 5 mil",
  "R$ 5 mil a R$ 20 mil",
  "R$ 20 mil a R$ 100 mil",
  "Acima de R$ 100 mil",
] as const;

export const PRAZOS = [
  "Sem prazo definido",
  "Mais de 3 meses",
  "Em 1 a 3 meses",
  "Neste mês",
  "Urgente (até 2 semanas)",
] as const;

export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(200),
  empresa: z.string().trim().min(2, "Informe a empresa").max(160),
  telefone: z.string().trim().max(30).optional(),
  cargo: z.string().trim().max(100).optional(),
  orcamento: z.enum(ORCAMENTOS, { message: "Escolha uma faixa" }),
  prazo: z.enum(PRAZOS, { message: "Escolha um prazo" }),
  mensagem: z.string().trim().min(10, "Conte um pouco mais (mín. 10 caracteres)").max(2000),
  // Honeypot: humanos não veem este campo; bots costumam preenchê-lo.
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
