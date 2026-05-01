// lib/duckdb.ts
import { DuckDBInstance } from "@duckdb/node-api";
import sentencesData from "@/data/sentences.json";

const globalForDuckDB = global as typeof global & {
  duckdbInstance?: DuckDBInstance;
};

export async function getDuckDBInstance(): Promise<DuckDBInstance> {
  if (!globalForDuckDB.duckdbInstance) {
    // Use in-memory database or file-based if DUCKDB_PATH is set
    const dbPath = process.env.DUCKDB_PATH ?? ":memory:";
    const instance = await DuckDBInstance.create(dbPath);

    const connection = await instance.connect();

    // Create sentences table if it doesn't exist
    await connection.run(`
      CREATE TABLE IF NOT EXISTS sentences (
        id INTEGER PRIMARY KEY,
        urdu VARCHAR NOT NULL,
        eng VARCHAR NOT NULL,
        arb VARCHAR NOT NULL
      )
    `);

    // Check if table is empty and seed if needed
    const countResult = await connection.run("SELECT COUNT(*) FROM sentences");
    const countRows = await countResult.getRows();
    const count = Number(countRows[0][0]);

    if (count === 0) {
      const prepared = await connection.prepare(
        "INSERT INTO sentences (id, urdu, eng, arb) VALUES ($1, $2, $3, $4)"
      );

      for (const sentence of sentencesData) {
        prepared.bindInteger(1, sentence.id);
        prepared.bindVarchar(2, sentence.urdu);
        prepared.bindVarchar(3, sentence.eng);
        prepared.bindVarchar(4, sentence.arb);
        await prepared.run();
      }

      prepared.destroySync();
    }

    connection.closeSync();

    globalForDuckDB.duckdbInstance = instance;
  }

  return globalForDuckDB.duckdbInstance;
}
