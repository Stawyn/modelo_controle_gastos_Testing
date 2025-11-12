// app/_lib/db.ts
import * as SQLite from "expo-sqlite";

export type DB = SQLite.SQLiteDatabase;

let dbPromise: Promise<DB> | null = null;

export async function getDb(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("meusgastos.db");
  }
  return dbPromise;
}

export async function exec(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.runAsync(sql, params);
}

export async function execAll(sqls: string[]) {
  const db = await getDb();
  for (const s of sqls) {
    if (s.trim().length === 0) continue;
    await db.runAsync(s);
  }
}

export async function query<T = any>(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
}

export async function queryOne<T = any>(sql: string, params: any[] = []) {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
