// services/tipoPagRec.ts
import { exec, query } from "../_lib/db";
export type TipoPagRec = { id: number; descricao: string };

export async function listarTiposPagRec() {
  return query<TipoPagRec>("SELECT id, descricao FROM tipo_pagrec ORDER BY descricao;");
}

export async function criarTipoPagRec(descricao: string) {
  await exec("INSERT INTO tipo_pagrec (descricao) VALUES (?)", [descricao.trim()]);
}

export async function removerTipoPagRec(id: number) {
  await exec("DELETE FROM tipo_pagrec WHERE id = ?", [id]);
}
