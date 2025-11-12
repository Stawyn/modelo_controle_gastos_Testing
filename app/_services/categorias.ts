// services/categorias.ts
import { exec, query } from "../_lib/db";
export type Categoria = { id: number; descricao: string };

export async function listarCategorias() {
  return query<Categoria>("SELECT id, descricao FROM categoria ORDER BY descricao;");
}

export async function criarCategoria(descricao: string) {
  await exec("INSERT INTO categoria (descricao) VALUES (?)", [descricao.trim()]);
}

export async function removerCategoria(id: number) {
  await exec("DELETE FROM categoria WHERE id = ?", [id]);
}
