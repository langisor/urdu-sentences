// scripts/seed.ts
import { createClient } from "redis";
import * as fs from "fs";
import * as path from "path";
import type { Sentence } from "../src/types/sentences";

async function seed() {
  const client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" });

  client.on("error", (err) => console.error("Redis Error:", err));
  await client.connect();

  // Read the JSON file
  const filePath = path.join(process.cwd(), "src", "data", "sentences.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const sentences: Sentence[] = JSON.parse(raw);

  console.log(`Seeding ${sentences.length} sentences...`);

  for (const sentence of sentences) {
    // Store each sentence as a Redis Hash under key: sentence:{id}
    await client.hSet(`sentence:${sentence.id}`, {
      id: sentence.id.toString(),
      urdu: sentence.urdu,
      eng: sentence.eng,
      arb: sentence.arb,
    });

    // Also maintain a Set of all IDs for easy lookup
    await client.sAdd("sentences:ids", sentence.id.toString());
  }

  console.log("✅ Seeding complete!");
  await client.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});