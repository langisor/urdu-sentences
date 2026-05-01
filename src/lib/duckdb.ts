// lib/duckdb.ts
import { DuckDBInstance } from "@duckdb/node-api";

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

    await connection.close();

    globalForDuckDB.duckdbInstance = instance;
  }

  return globalForDuckDB.duckdbInstance;
}
