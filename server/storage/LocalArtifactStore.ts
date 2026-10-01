import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import type { ArtifactMetadata, ArtifactPut, ArtifactStore } from '../persistence/contracts';
import { canonicalJson, PersistenceConflict, required } from '../persistence/integrity';

const digest = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
/** Development/test storage. Atomic directory publication keeps bytes and metadata together. */
export class LocalArtifactStore implements ArtifactStore {
  private root: string;
  constructor(root: string) { required(root, 'artifact root'); this.root = path.resolve(root); }
  private async directory(projectId: string, key: string): Promise<string> {
    required(projectId, 'projectId');
    if (!/^[a-f0-9]{64}\/[a-f0-9]{64}$/.test(key) || key.split('/')[0] !== digest(projectId)) throw new Error('Invalid artifact key or project scope');
    await fs.mkdir(this.root, { recursive: true, mode: 0o700 });
    if ((await fs.lstat(this.root)).isSymbolicLink() || await fs.realpath(this.root) !== this.root) throw new Error('Artifact root must be a real directory');
    let dir = this.root;
    for (const segment of key.split('/')) {
      dir = path.join(dir,segment);
      const stat = await fs.lstat(dir).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
      if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) throw new Error('Artifact path must not contain links or files');
    }
    return dir;
  }
  async put(input: ArtifactPut): Promise<ArtifactMetadata> {
    required(input.artifactId,'artifactId'); required(input.mimeType,'mimeType');
    if (!['REDISTRIBUTABLE','CACHE_ALLOWED'].includes(input.rightsClassification)) throw new Error('Artifact bytes storage not permitted by rights classification');
    if (!Number.isFinite(Date.parse(input.createdAt))) throw new Error('Invalid artifact timestamp');
    const objectKey = `${digest(input.projectId)}/${digest(input.artifactId)}`;
    const dir = await this.directory(input.projectId,objectKey);
    const { bytes, ...attributes } = input;
    const metadata: ArtifactMetadata = { ...attributes, objectKey, uri: pathToFileURL(path.join(dir,'content')).href, sha256: digest(bytes), sizeBytes: bytes.byteLength, immutable: true };
    const existing = await this.stat(input.projectId,objectKey);
    if (existing) { if (canonicalJson(existing) !== canonicalJson(metadata)) throw new PersistenceConflict('Immutable artifact ID has different bytes or metadata'); return existing; }
    await fs.mkdir(path.dirname(dir),{recursive:true,mode:0o700});
    await this.directory(input.projectId,objectKey);
    const temporary = await fs.mkdtemp(path.join(path.dirname(dir),'.staged-'));
    try {
      const content = await fs.open(path.join(temporary,'content'),'wx',0o600);
      try { await content.writeFile(bytes); await content.sync(); } finally { await content.close(); }
      const manifest = await fs.open(path.join(temporary,'metadata.json'),'wx',0o600);
      try { await manifest.writeFile(canonicalJson(metadata)); await manifest.sync(); } finally { await manifest.close(); }
      try { await fs.rename(temporary,dir); }
      catch (e) {
        if (!['EEXIST','ENOTEMPTY'].includes(e.code)) throw e;
        const winner = await this.stat(input.projectId,objectKey);
        if (canonicalJson(winner) !== canonicalJson(metadata)) throw new PersistenceConflict('Concurrent immutable artifact conflict');
      }
      return metadata;
    } finally { await fs.rm(temporary,{recursive:true,force:true}); }
  }
  async stat(projectId: string, objectKey: string): Promise<ArtifactMetadata | null> {
    const dir = await this.directory(projectId,objectKey);
    const exists = await fs.lstat(dir).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
    if (!exists) return null;
    for (const file of ['metadata.json','content']) { const stat = await fs.lstat(path.join(dir,file)); if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid artifact file'); }
    const metadata: ArtifactMetadata = JSON.parse(await fs.readFile(path.join(dir,'metadata.json'),'utf8'));
    if (metadata.projectId !== projectId || metadata.objectKey !== objectKey || metadata.immutable !== true) throw new Error('Artifact metadata scope/integrity mismatch');
    const bytes = await fs.readFile(path.join(dir,'content'));
    if (bytes.length !== metadata.sizeBytes || digest(bytes) !== metadata.sha256) throw new Error('Artifact content integrity mismatch');
    return metadata;
  }
  async exists(projectId: string, objectKey: string) { return (await this.stat(projectId,objectKey)) !== null; }
  async getReadReference(projectId: string, objectKey: string) {
    if (!await this.stat(projectId,objectKey)) throw new Error('Artifact not found');
    return path.join(await this.directory(projectId,objectKey),'content');
  }
}
