// app/_lib/migrations.ts
import { execAll, queryOne } from "./db";

const SCHEMA_VERSION = 1;

export async function ensureMigrations() {
  // Habilita FKs e lê versão atual
  await execAll([
    "PRAGMA foreign_keys = ON;",
  ]);

  const row = await queryOne<{ user_version: number }>("PRAGMA user_version;");
  const current = row?.user_version ?? 0;

  // v1: criar tabelas e índices
  if (current < 1) {
    await execAll([
      `CREATE TABLE IF NOT EXISTS categoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL UNIQUE
      );`,

      `CREATE TABLE IF NOT EXISTS tipo_pagrec (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL UNIQUE
      );`,

      `CREATE TABLE IF NOT EXISTS lancamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        valor REAL NOT NULL,
        categoria_id INTEGER NOT NULL,
        tipopagrec_id INTEGER NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('D','C')),
        observacao TEXT,
        FOREIGN KEY (categoria_id)  REFERENCES categoria(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (tipopagrec_id) REFERENCES tipo_pagrec(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );`,

      `CREATE INDEX IF NOT EXISTS idx_lanc_data ON lancamento(data);`,
      `CREATE INDEX IF NOT EXISTS idx_lanc_cat  ON lancamento(categoria_id);`,
      `CREATE INDEX IF NOT EXISTS idx_lanc_tpr  ON lancamento(tipopagrec_id);`,

      // seeds opcionais
      `INSERT OR IGNORE INTO tipo_pagrec (descricao) VALUES ('Dinheiro'),('Pix'),('Cartão'),('Transferência');`,
      `INSERT OR IGNORE INTO categoria (descricao) VALUES ('Alimentação'),('Transporte'),('Salário'),('Saúde');`,

      `PRAGMA user_version = ${SCHEMA_VERSION};`,
    ]);
  }
}
