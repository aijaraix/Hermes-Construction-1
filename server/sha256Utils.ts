import crypto from 'crypto';

/**
 * Validates whether a string is a valid 64-character hexadecimal SHA-256 digest.
 * Must match ^[a-fA-F0-9]{64}$
 */
export function isValidSha256(hash: string | undefined | null): boolean {
  if (!hash || typeof hash !== 'string') return false;
  return /^[a-fA-F0-9]{64}$/.test(hash.trim());
}

/**
 * Computes a genuine 64-character hex SHA-256 digest for a given buffer or string.
 */
export function computeSha256(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
