import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let instancia: ReturnType<typeof criar> | undefined;

function criar() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida (veja .env.example)");
  return drizzle(neon(url), { schema });
}

// Criação preguiçosa: o build não falha se a variável só existir em runtime.
export function getDb() {
  return (instancia ??= criar());
}
