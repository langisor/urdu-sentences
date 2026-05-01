"use server";

import { getDuckDBInstance } from "@/lib/duckdb";
import type { Sentence } from "@/types/sentences";

export type SearchField = "all" | "urdu" | "eng" | "arb";

export interface SearchResult extends Sentence {
  matchedField: SearchField;
}

export async function searchSentences(
  query: string,
  field: SearchField = "all"
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const instance = await getDuckDBInstance();
  const connection = await instance.connect();

  const normalizedQuery = query.toLowerCase().trim();
  const likePattern = `%${normalizedQuery}%`;

  let sql: string;
  const params: string[] = [likePattern];

  if (field === "all") {
    sql = `
      SELECT id, urdu, eng, arb,
        CASE
          WHEN LOWER(urdu) LIKE $1 THEN 'urdu'
          WHEN LOWER(eng) LIKE $1 THEN 'eng'
          WHEN LOWER(arb) LIKE $1 THEN 'arb'
        END as matched_field
      FROM sentences
      WHERE LOWER(urdu) LIKE $1 OR LOWER(eng) LIKE $1 OR LOWER(arb) LIKE $1
      ORDER BY id
    `;
  } else {
    sql = `
      SELECT id, urdu, eng, arb, '${field}' as matched_field
      FROM sentences
      WHERE LOWER(${field}) LIKE $1
      ORDER BY id
    `;
  }

  const result = await connection.run(sql, params);
  const rows = result.getRows();
  await connection.close();

  return rows.map((row: unknown[]) => ({
    id: Number(row[0]),
    urdu: String(row[1]),
    eng: String(row[2]),
    arb: String(row[3]),
    matchedField: row[4] as SearchField,
  }));
}

// ── Returns every sentence, matchedField set to "all" ────────────────────────
export async function getAllSentences(): Promise<SearchResult[]> {
  const instance = await getDuckDBInstance();
  const connection = await instance.connect();

  const result = await connection.run(
    "SELECT id, urdu, eng, arb FROM sentences ORDER BY id"
  );

  const rows = result.getRows();
  await connection.close();

  return rows.map((row: unknown[]) => ({
    id: Number(row[0]),
    urdu: String(row[1]),
    eng: String(row[2]),
    arb: String(row[3]),
    matchedField: "all" as SearchField,
  }));
}