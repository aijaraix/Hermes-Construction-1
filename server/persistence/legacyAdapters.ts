import fs from 'node:fs/promises';
import path from 'node:path';
import { safeJsonParse } from './persistenceStore';

export const legacyOwners = [
  {owner:'LiveHouse',path:'data/hermesLiveHouseState.json',schema:'live-house-world'},
  {owner:'sql.js',path:'data/db/hermes_sqlite.db',schema:'prototype-sqlite'},
  {owner:'PersistenceStore',path:'data/db/hermes_store.json',schema:'generic-durable-store'},
  {owner:'LearningPersistence',path:'data/db/hermes_store.json',schema:'learning-store'},
] as const;
export function legacyOwnershipCollisions() {
  return [...new Set(legacyOwners.map(o=>o.path))].map(path=>({path,owners:legacyOwners.filter(o=>o.path===path).map(o=>o.owner)})).filter(x=>x.owners.length>1);
}
/** Explicit read-only migration seam. Reads never normalize, write, delete or initialize stores. */
export class LegacyJsonReader {
  constructor(private root: string, readonly owner: 'LiveHouse'|'PersistenceStore'|'LearningPersistence') {}
  async read<T>(): Promise<T|null> {
    const entry=legacyOwners.find(o=>o.owner===this.owner)!;
    let raw: string;try {raw=await fs.readFile(path.join(this.root,entry.path),'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}
    const value=this.owner==='PersistenceStore'?safeJsonParse<T>(raw):JSON.parse(raw);
    if (this.owner==='PersistenceStore' && (!('systemState' in value) || !('projects' in value))) throw new Error('Wrong legacy producer schema; no automatic import');
    if (this.owner==='LearningPersistence' && (!('scenarios' in value) || !('executions' in value))) throw new Error('Wrong legacy producer schema; no automatic import');
    return value;
  }
}
/** Existing producers remain available on demand, with their original runtime behavior. */
export const legacyRuntime = {
  liveHouse: () => import('../hermesLiveHouseEngine'),
  sqljs: () => import('./sqliteAdapter'),
  generic: () => import('./persistenceStore'),
  learning: () => import('./learningPersistence'),
};
