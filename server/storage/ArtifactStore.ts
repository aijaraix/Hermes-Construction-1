export type { ArtifactStore, ArtifactMetadata, ArtifactPut } from '../persistence/contracts';
export { LocalArtifactStore } from './LocalArtifactStore';

export function requireRemoteArtifactStore(): never {
  throw new Error('Remote artifact storage is not configured; no fallback to local disk is permitted');
}
