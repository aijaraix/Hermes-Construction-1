import pg from 'pg';
import type { Pool, PoolClient, PoolConfig } from 'pg';

export function postgresConfig(env: NodeJS.ProcessEnv = process.env): PoolConfig {
  if (!env.DATABASE_URL) throw new Error('PostgreSQL selected but DATABASE_URL is unavailable');
  let url: URL;
  try { url = new URL(env.DATABASE_URL); } catch { throw new Error('Invalid PostgreSQL configuration'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid PostgreSQL connection protocol');
  if (env.HERMES_DATABASE_SSL && !['require','disable'].includes(env.HERMES_DATABASE_SSL)) throw new Error('HERMES_DATABASE_SSL must be require or disable');
  return { connectionString: env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
    ...(env.HERMES_DATABASE_SSL === 'require' ? { ssl: { rejectUnauthorized: true } } : env.HERMES_DATABASE_SSL === 'disable' ? { ssl: false } : {}) };
}
export function createPostgresPool(env: NodeJS.ProcessEnv = process.env): Pool { return new pg.Pool(postgresConfig(env)); }
export async function postgresHealth(pool: Pool): Promise<{ available: boolean; postgisVersion?: string }> {
  try { const r = await pool.query('SELECT PostGIS_Lib_Version() AS version'); return { available: true, postgisVersion: r.rows[0].version }; }
  catch { return { available: false }; }
}
export async function withTransaction<T>(pool: Pick<Pool, 'connect'>, action: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await action(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
  finally { client.release(); }
}
