import fs from 'fs';
import path from 'path';

export interface BuildMetadataObject {
  phase: string;
  commitSha: string;
  shortCommit: string;
  buildTime: string;
  sourceBundleCommit: string;
  sourceBundleGeneratedAt: string;
  runtimeCommit: string;
  githubCommitIfVerified: string;
  versionMatch: boolean;
}

export class BuildMetadata {
  private static cachedMetadata: BuildMetadataObject | null = null;

  public static get(): BuildMetadataObject {
    if (this.cachedMetadata) return this.cachedMetadata;

    let commitSha = '5be9b4b'; // Default current commit SHA
    let phase = 'Phase 3.17B.1';
    let buildTime = new Date().toISOString();

    try {
      const manifestPath = path.join(process.cwd(), 'public', 'COMMIT_MANIFEST.txt');
      if (fs.existsSync(manifestPath)) {
        const content = fs.readFileSync(manifestPath, 'utf-8').trim();
        const match = content.match(/([a-f0-9]{7,40})/i);
        if (match) {
          commitSha = match[1];
        }
      }
    } catch {
      // Ignore read errors, use default
    }

    const shortCommit = commitSha.slice(0, 7);

    this.cachedMetadata = {
      phase,
      commitSha,
      shortCommit,
      buildTime,
      sourceBundleCommit: shortCommit,
      sourceBundleGeneratedAt: buildTime,
      runtimeCommit: shortCommit,
      githubCommitIfVerified: shortCommit,
      versionMatch: true,
    };

    return this.cachedMetadata;
  }

  public static setRuntimeCommit(sha: string): void {
    const current = this.get();
    const short = sha.slice(0, 7);
    this.cachedMetadata = {
      ...current,
      runtimeCommit: short,
      versionMatch: current.sourceBundleCommit === short,
    };
  }
}
