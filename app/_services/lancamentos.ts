// services/lancamentos.ts
import { exec, query } from "../_lib/db";

export type Lancamento = {
  id: number;
  data: string;           // "2025-10-12" (recomendado ISO)
  valor: number;
  categoria_id: number;
  tipopagrec_id: number;
  tipo: "D" | "C";
  observacao?: string | null;
};

// Valores agregados usados na tela home para saldo e gráficos
export type ResumoLancamentos = {
  entradas: number;
  saidas: number;
};

export async function listarLancamentos(limit = 50) {
  return query<Lancamento & { categoria: string; tipopagrec: string }>(
    `
    SELECT l.*,
           c.descricao AS categoria,
           t.descricao AS tipopagrec
    FROM lancamento l
    JOIN categoria   c ON c.id = l.categoria_id
    JOIN tipo_pagrec t ON t.id = l.tipopagrec_id
    ORDER BY date(l.data) DESC, l.id DESC
    LIMIT ?;
    `,
    [limit]
  );
}

export async function criarLancamento(l: Omit<Lancamento, "id">) {
  await exec(
    `
    INSERT INTO lancamento (data, valor, categoria_id, tipopagrec_id, tipo, observacao)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [l.data, l.valor, l.categoria_id, l.tipopagrec_id, l.tipo, l.observacao ?? null]
  );
}

export async function removerLancamento(id: number) {
  await exec("DELETE FROM lancamento WHERE id = ?", [id]);
}

// Soma créditos (C) e débitos (D) direto no SQLite para evitar cálculos no app
export async function obterResumoLancamentos(): Promise<ResumoLancamentos> {
  const totais = await query<{ tipo: "D" | "C"; total: number }>(
    `SELECT tipo, SUM(valor) AS total FROM lancamento GROUP BY tipo;`
  );

  return totais.reduce<ResumoLancamentos>(
    (acc, atual) => {
      if (atual.tipo === "C") {
        acc.entradas = Number(atual.total) || 0;
      } else {
        acc.saidas = Number(atual.total) || 0;
      }
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );
}
