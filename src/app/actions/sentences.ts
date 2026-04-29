// app/actions/sentences.ts
"use server";

import { getRedisClient } from "@/lib/redis";
import type { Sentence } from "@/types/sentences";

// Fetch a single sentence by ID
export async function getSentence(id: number): Promise<Sentence | null> {
  const client = await getRedisClient();
  const data = await client.hGetAll(`sentence:${id}`);

  if (!data || Object.keys(data).length === 0) return null;

  return {
    id: Number(data.id),
    urdu: data.urdu,
    eng: data.eng,
    arb: data.arb,
  };
}

// Fetch all sentences
export async function getAllSentences(): Promise<Sentence[]> {
  const client = await getRedisClient();
  const ids = await client.sMembers("sentences:ids");

  const sentences = await Promise.all(
    ids.map(async (id) => {
      const data = await client.hGetAll(`sentence:${id}`);
      return {
        id: Number(data.id),
        urdu: data.urdu,
        eng: data.eng,
        arb: data.arb,
      } as Sentence;
    })
  );

  // Sort by ID since Sets are unordered
  return sentences.sort((a, b) => a.id - b.id);
}