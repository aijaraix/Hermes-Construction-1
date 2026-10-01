import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { Pool } from 'pg';
import { withTransaction } from './postgres';

/** Explicit forward migration only. No startup migration, down migration or auto-reset. */
export async function migrateFoundation(pool: Pool, directory = path.resolve('server/persistence/migrations')): Promise<string[]> {
  const names = (await fs.readdir(directory)).filter(n => /^\d{4}_[a-z0-9_]+\.sql$/.test(n)).sort();
  if (!names.length) throw new Error('Foundation SQL migrations unavailable');
  const migrations = await Promise.all(names.map(async name => { const sql = await fs.readFile(path.join(directory,name),'utf8'); return {name,sql,hash:createHash('sha256').update(sql).digest('hex')}; }));
  return withTransaction(pool,async client => {
    await client.query('SELECT pg_advisory_xact_lock(724318903)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const old = await client.query('SELECT name,checksum FROM schema_migrations ORDER BY name');
    if (old.rows.some(row => !migrations.some(m => m.name === row.name && m.hash === row.checksum))) throw new Error('Applied migration missing or checksum drift');
    if (old.rows.some((row,index) => row.name !== migrations[index]?.name)) throw new Error('Migration order drift');
    const applied: string[] = [];
    for (const migration of migrations.slice(old.rows.length)) {
      await client.query(migration.sql);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES ($1,$2)',[migration.name,migration.hash]);
      applied.push(migration.name);
    }
    return applied;
  });
}
