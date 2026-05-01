// app/actions/sentences.ts
"use server";

import { getDuckDBInstance } from "@/lib/duckdb";
import type { Sentence } from "@/types/sentences";

// Fetch a single sentence by ID
export async function getSentence(id: number): Promise<Sentence | null> {
  const instance = await getDuckDBInstance();
  const connection = await instance.connect();

  const result = await connection.run(
    "SELECT id, urdu, eng, arb FROM sentences WHERE id = $1",
    [id]
  );

  const rows = await result.getRows();
  connection.closeSync();

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: Number(row[0]),
    urdu: String(row[1]),
    eng: String(row[2]),
    arb: String(row[3]),
  };
}

// Fetch all sentences
export async function getAllSentences(): Promise<Sentence[]> {
  const instance = await getDuckDBInstance();
  const connection = await instance.connect();

  const result = await connection.run(
    "SELECT id, urdu, eng, arb FROM sentences ORDER BY id"
  );

  const rows = await result.getRows();
  connection.closeSync();

  return rows.map((row: unknown[]) => ({
    id: Number(row[0]),
    urdu: String(row[1]),
    eng: String(row[2]),
    arb: String(row[3]),
  }));
}