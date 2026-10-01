/** Explicit internal composition entry. No upload route, automatic import or database cutover. */
import type { ArtifactStore } from '../persistence/contracts';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';
import { PostgresModelImportRepository } from '../persistence/PostgresModelImportRepository';
import { ModelImportService } from './modelImportService';
import { WebIfcServerNormalizer } from './WebIfcServerNormalizer';

export { ModelImportService, WebIfcServerNormalizer, PostgresModelImportRepository };
export type * from './IfcNormalizer';
export function createOpenBimService(artifacts: ArtifactStore, foundation?: PostgresFoundationRepository): ModelImportService {
  return new ModelImportService(artifacts,new WebIfcServerNormalizer(),foundation?new PostgresModelImportRepository(foundation):undefined);
}
