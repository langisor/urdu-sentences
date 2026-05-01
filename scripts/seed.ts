// scripts/seed.ts
import { DuckDBInstance } from "@duckdb/node-api";
import * as fs from "fs";
import * as path from "path";
import type { Sentence } from "../src/types/sentences";

async function seed() {
  // Use in-memory database or file-based if DUCKDB_PATH is set
  const dbPath = process.env.DUCKDB_PATH ?? ":memory:";
  const instance = await DuckDBInstance.create(dbPath);
  const connection = await instance.connect();

  // Create sentences table
  await connection.run(`
    CREATE TABLE IF NOT EXISTS sentences (
      id INTEGER PRIMARY KEY,
      urdu VARCHAR NOT NULL,
      eng VARCHAR NOT NULL,
      arb VARCHAR NOT NULL
    )
  `);

  // Clear existing data
  await connection.run("DELETE FROM sentences");

  // Read the JSON file
  const filePath = path.join(process.cwd(), "src", "data", "sentences.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const sentences: Sentence[] = JSON.parse(raw);

  console.log(`Seeding ${sentences.length} sentences...`);

  // Insert all sentences using a prepared statement for efficiency
  const prepared = await connection.prepare(
    "INSERT INTO sentences (id, urdu, eng, arb) VALUES ($1, $2, $3, $4)"
  );

  for (const sentence of sentences) {
    prepared.bindInteger(1, sentence.id);
    prepared.bindVarchar(2, sentence.urdu);
    prepared.bindVarchar(3, sentence.eng);
    prepared.bindVarchar(4, sentence.arb);
    await prepared.run();
  }

  await prepared.dispose();
  await connection.close();

  console.log("✅ Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});