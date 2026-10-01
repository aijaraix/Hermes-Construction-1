import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { LocalArtifactStore } from '../storage/LocalArtifactStore';
import { requireRemoteArtifactStore } from '../storage/ArtifactStore';
import { createPersistence, persistenceDriver } from '../persistence/persistenceFactory';
import { postgresConfig, withTransaction } from '../persistence/postgres';
import { canonicalJson, compareEventHash, eventHash, validateFrame } from '../persistence/integrity';
import { LegacyJsonReader, legacyOwnershipCollisions } from '../persistence/legacyAdapters';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';
import { migrateFoundation } from '../persistence/migrate';

const directories: string[]=[];
const temporary=async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'hermes-fnd03-'));directories.push(dir);return dir;};
afterEach(async()=>{await Promise.all(directories.splice(0).map(d=>fs.rm(d,{recursive:true,force:true})));vi.restoreAllMocks();});
const artifact=()=>({artifactId:'A',projectId:'P',artifactClass:'EVIDENCE' as const,mimeType:'text/plain',rightsClassification:'CACHE_ALLOWED' as const,createdAt:'2026-09-30T12:00:00Z',bytes:new TextEncoder().encode('original evidence')});
const event=()=>({sequence:1,record:{projectId:'P',eventId:'E',eventType:'OBSERVATION',timestamp:'2026-09-30T12:00:00Z',payload:{x:1,y:2}}});

describe('FND-03 configuration and immutable local artifacts',()=>{
  it('CFG-01 legacy remains default even with DATABASE_URL present; no pool is opened',()=>{
    expect(persistenceDriver({DATABASE_URL:'postgresql://not-used.invalid/test'})).toBe('legacy');
    expect(createPersistence({organizationId:'O',projectId:'P'},{}).driver).toBe('legacy');
  });
  it('CFG-02 explicit postgres without configuration fails closed; unknown drivers fail',()=>{
    expect(()=>createPersistence({organizationId:'O',projectId:'P'},{HERMES_PERSISTENCE_DRIVER:'postgres'})).toThrow(/DATABASE_URL/);
    expect(()=>persistenceDriver({HERMES_PERSISTENCE_DRIVER:'sqlite'})).toThrow();
    expect(()=>postgresConfig({DATABASE_URL:'https://invalid.test'})).toThrow(/protocol/);
    expect(()=>requireRemoteArtifactStore()).toThrow(/no fallback/);
  });
  it('verified TLS is retained when SSL is required',()=>{
    expect(postgresConfig({DATABASE_URL:'postgresql://localhost/test',HERMES_DATABASE_SSL:'require'}).ssl).toEqual({rejectUnauthorized:true});
  });
  it('ART-01 writes real bytes, computes hash and reads scoped metadata/reference',async()=>{
    const store=new LocalArtifactStore(await temporary());const a=artifact();const saved=await store.put(a);
    expect(saved.sha256).toBe(createHash('sha256').update(a.bytes).digest('hex'));
    expect(await fs.readFile(await store.getReadReference('P',saved.objectKey))).toEqual(Buffer.from(a.bytes));
    expect(await store.stat('P',saved.objectKey)).toEqual(saved);expect(await store.exists('P',saved.objectKey)).toBe(true);
    expect(await store.put(a)).toEqual(saved);
  });
  it('ART-02 different content or rights cannot replace immutable identity; concurrent exact retries agree',async()=>{
    const store=new LocalArtifactStore(await temporary());const a=artifact();
    const [first,second]=await Promise.all([store.put(a),store.put(a)]);expect(first).toEqual(second);
    await expect(store.put({...a,bytes:new Uint8Array([1])})).rejects.toThrow(/Immutable/);
    await expect(store.put({...a,rightsClassification:'REDISTRIBUTABLE'})).rejects.toThrow(/Immutable/);
    expect(await store.stat('P',first.objectKey)).toEqual(first);
  });
  it('ART-03 rejects traversal, foreign project, symlink and rights-restricted bytes',async()=>{
    const root=await temporary();const store=new LocalArtifactStore(root);const saved=await store.put(artifact());
    for(const key of ['../outside','/etc/passwd',saved.objectKey+'/../../secret',saved.objectKey.replace('/','\\')])await expect(store.stat('P',key)).rejects.toThrow();
    await expect(store.stat('OTHER',saved.objectKey)).rejects.toThrow(/scope/);
    await expect(store.put({...artifact(),rightsClassification:'DO_NOT_STORE'})).rejects.toThrow(/rights/);
    const link=path.join(await temporary(),'link');await fs.symlink(root,link);
    await expect(new LocalArtifactStore(link).put(artifact())).rejects.toThrow(/real directory/);
  });
  it('detects bytes modified outside the store, not just matching metadata',async()=>{
    const store=new LocalArtifactStore(await temporary());const saved=await store.put(artifact());const file=await store.getReadReference('P',saved.objectKey);
    await fs.writeFile(file,'tampered');await expect(store.stat('P',saved.objectKey)).rejects.toThrow(/integrity/);
  });
});

describe('FND-03 append-only event and transaction contracts (mock SQL, not DB acceptance)',()=>{
  it('EVT-01/02 semantic JSON retry is idempotent and changed content conflicts',()=>{
    const a=event();const same={record:{...a.record,payload:{y:2,x:1}},sequence:1};
    expect(compareEventHash(undefined,eventHash(a))).toBe('APPENDED');
    expect(compareEventHash(eventHash(a),eventHash(same))).toBe('IDEMPOTENT');
    expect(()=>compareEventHash(eventHash(a),eventHash({...a,record:{...a.record,payload:{x:3}}}))).toThrow(/different/);
    expect(()=>eventHash({...a,sequence:NaN})).toThrow();
    expect(()=>canonicalJson({x:Infinity})).toThrow();
  });
  it('EVT-03 ordinary repository exposes no event update/delete; scoped access fails closed',async()=>{
    const query=vi.fn(async(_sql:string,_params?:unknown[])=>({rows:[],rowCount:0}));const release=vi.fn();const pool={connect:async()=>({query,release})} as any;
    const repo=new PostgresFoundationRepository(pool,{organizationId:'O',projectId:'P'});
    expect(repo).not.toHaveProperty('updateEvent');expect(repo).not.toHaveProperty('deleteEvent');
    await expect(repo.appendEvent(event())).rejects.toThrow(/scope/);
    expect(query.mock.calls.map(c=>c[0])).toContain('ROLLBACK');expect(release).toHaveBeenCalledOnce();
  });
  it('rollback and release happen after mid-transaction failure and COMMIT is absent',async()=>{
    const calls:string[]=[];const release=vi.fn();const pool={connect:async()=>({query:async(s:string)=>{calls.push(s);},release})} as any;
    await expect(withTransaction(pool,async c=>{await c.query('INSERT test operation');throw new Error('second operation failed');})).rejects.toThrow(/second/);
    expect(calls).toEqual(['BEGIN','INSERT test operation','ROLLBACK']);expect(release).toHaveBeenCalledOnce();
  });
  it('migration checksum drift rolls back without applying SQL',async()=>{
    const dir=await temporary();await fs.writeFile(path.join(dir,'0001_foundation.sql'),'SELECT 1;');
    const calls:string[]=[];const pool={connect:async()=>({query:async(sql:string)=>{calls.push(sql);return {rows:sql.startsWith('SELECT name')?[{name:'0001_foundation.sql',checksum:'changed'}]:[]};},release:()=>{}})} as any;
    await expect(migrateFoundation(pool,dir)).rejects.toThrow(/checksum drift/);
    expect(calls).not.toContain('SELECT 1;');expect(calls.at(-1)).toBe('ROLLBACK');
  });
});

describe('FND-03 compatibility and schema requirements',()=>{
  it('LEGACY-01 live-house fixture read preserves exact bytes',async()=>{
    const root=await temporary();await fs.mkdir(path.join(root,'data'));const file=path.join(root,'data/hermesLiveHouseState.json');const bytes='{"projectId":"LEGACY", "events":[]}\n';await fs.writeFile(file,bytes);
    expect(await new LegacyJsonReader(root,'LiveHouse').read()).toEqual({projectId:'LEGACY',events:[]});expect(await fs.readFile(file,'utf8')).toBe(bytes);
  });
  it('LEGACY-02 the two incompatible owners are identified and cannot import each other',async()=>{
    expect(legacyOwnershipCollisions()).toEqual([{path:'data/db/hermes_store.json',owners:['PersistenceStore','LearningPersistence']}]);
    const root=await temporary();await fs.mkdir(path.join(root,'data/db'),{recursive:true});await fs.writeFile(path.join(root,'data/db/hermes_store.json'),'{"scenarios":[],"executions":[]}');
    await expect(new LegacyJsonReader(root,'PersistenceStore').read()).rejects.toThrow(/producer/);
    expect(await new LegacyJsonReader(root,'LearningPersistence').read()).toEqual({scenarios:[],executions:[]});
  });
  it('SPATIAL-01 local XYZ retains its local frame with no invented CRS',()=>{
    const local={frame:{projectId:'P',frameId:'SITE',kind:'SITE_LOCAL' as const},revisionId:'R',unit:'METER' as const};
    expect(()=>validateFrame(local)).not.toThrow();
    expect(()=>validateFrame({...local,crs:'EPSG:4326'})).toThrow(/Local XYZ/);
    expect(()=>validateFrame({...local,crs:'EPSG:4326',geodeticOrigin:{latitudeDeg:0,longitudeDeg:0,elevationMeters:0}})).toThrow(/GEODETIC/);
  });
  it('SCHEMA-01/02 planned tables and composite project FK ownership are present (not migration execution)',async()=>{
    const sql=await fs.readFile('server/persistence/migrations/0001_foundation.sql','utf8');
    for(const table of ['organizations','projects','project_revisions','entities','entity_revisions','external_identities','spatial_frames','spatial_transforms','events','sources','evidence','claims','artifacts'])expect(sql).toContain(`CREATE TABLE ${table}`);
    expect(sql).toContain('FOREIGN KEY (project_id,source_id)');expect(sql).toContain('REFERENCES organizations(organization_id)');
    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS postgis');expect(sql).toContain('CREATE TRIGGER events_immutable');
  });
});
