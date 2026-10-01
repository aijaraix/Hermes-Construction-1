import { createPostgresPool, postgresHealth } from './postgres';
import { PostgresFoundationRepository } from './PostgresFoundationRepository';
import { legacyRuntime } from './legacyAdapters';
import type { RepositoryScope } from './contracts';

export function persistenceDriver(env: NodeJS.ProcessEnv=process.env): 'legacy'|'postgres' {
  const driver=env.HERMES_PERSISTENCE_DRIVER??'legacy';
  if(driver!=='legacy'&&driver!=='postgres')throw new Error('Unknown HERMES_PERSISTENCE_DRIVER');
  return driver;
}
/** Additive explicit boundary; does not replace current hydration or enable dual writes. */
export function createPersistence(scope: RepositoryScope,env: NodeJS.ProcessEnv=process.env) {
  if(persistenceDriver(env)==='legacy')return {driver:'legacy' as const,runtime:legacyRuntime};
  const pool=createPostgresPool(env);
  return {driver:'postgres' as const,repository:new PostgresFoundationRepository(pool,scope),health:()=>postgresHealth(pool),close:()=>pool.end()};
}
