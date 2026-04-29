"use server";

import { getRedisClient } from "@/lib/redis";
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

  const client = await getRedisClient();
  const ids = await client.sMembers("sentences:ids");
  if (!ids.length) return [];

  const pipeline = client.multi();
  for (const id of ids) pipeline.hGetAll(`sentence:${id}`);
  const results = await pipeline.exec();

  const normalizedQuery = query.toLowerCase().trim();
  const matched: SearchResult[] = [];

  for (const entry of results) {
    const data = entry as unknown as Record<string, string>;
    if (!data || typeof data !== "object" || !data.id) continue;

    const sentence: Sentence = {
      id:   Number(data.id),
      urdu: data.urdu ?? "",
      eng:  data.eng  ?? "",
      arb:  data.arb  ?? "",
    };

    const fieldsToSearch: Array<Exclude<SearchField, "all">> =
      field === "all" ? ["urdu", "eng", "arb"] : [field];

    for (const f of fieldsToSearch) {
      if (sentence[f]?.toLowerCase().includes(normalizedQuery)) {
        matched.push({ ...sentence, matchedField: f });
        break;
      }
    }
  }

  return matched.sort((a, b) => a.id - b.id);
}

// ── Returns every sentence, matchedField set to "all" ────────────────────────
export async function getAllSentences(): Promise<SearchResult[]> {
  const client = await getRedisClient();
  const ids = await client.sMembers("sentences:ids");
  if (!ids.length) return [];

  const pipeline = client.multi();
  for (const id of ids) pipeline.hGetAll(`sentence:${id}`);
  const results = await pipeline.exec();

  const sentences: SearchResult[] = [];

  for (const entry of results) {
    const data = entry as unknown as Record<string, string>;
    if (!data || typeof data !== "object" || !data.id) continue;

    sentences.push({
      id:           Number(data.id),
      urdu:         data.urdu ?? "",
      eng:          data.eng  ?? "",
      arb:          data.arb  ?? "",
      matchedField: "all",
    });
  }

  return sentences.sort((a, b) => a.id - b.id);
}