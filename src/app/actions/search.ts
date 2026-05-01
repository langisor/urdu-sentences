"use server";

import sentencesData from "@/data/sentences.json";
import type { Sentence } from "@/types/sentences";

export type SearchField = "all" | "urdu" | "eng" | "arb";

export interface SearchResult extends Sentence {
  matchedField: SearchField;
}

const sentences: Sentence[] = sentencesData;

export async function searchSentences(
  query: string,
  field: SearchField = "all"
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();

  const results: SearchResult[] = [];

  for (const sentence of sentences) {
    const urduLower = sentence.urdu.toLowerCase();
    const engLower = sentence.eng.toLowerCase();
    const arbLower = sentence.arb.toLowerCase();

    let matchedField: SearchField | null = null;

    if (field === "all") {
      if (urduLower.includes(normalizedQuery)) matchedField = "urdu";
      else if (engLower.includes(normalizedQuery)) matchedField = "eng";
      else if (arbLower.includes(normalizedQuery)) matchedField = "arb";
    } else if (field === "urdu" && urduLower.includes(normalizedQuery)) {
      matchedField = "urdu";
    } else if (field === "eng" && engLower.includes(normalizedQuery)) {
      matchedField = "eng";
    } else if (field === "arb" && arbLower.includes(normalizedQuery)) {
      matchedField = "arb";
    }

    if (matchedField) {
      results.push({
        ...sentence,
        matchedField,
      });
    }
  }

  return results.sort((a, b) => a.id - b.id);
}

// ── Returns every sentence, matchedField set to "all" ────────────────────────
export async function getAllSentences(): Promise<SearchResult[]> {
  return sentences
    .map((s) => ({ ...s, matchedField: "all" as SearchField }))
    .sort((a, b) => a.id - b.id);
}