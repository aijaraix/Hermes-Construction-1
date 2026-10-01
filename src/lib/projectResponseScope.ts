// UI request scope only; canonical state remains in HermesProjectContext.
export interface ProjectResponseScope { projectId: string; generation: number }
export function isCurrentProjectResponse(request: ProjectResponseScope, current: ProjectResponseScope, value: unknown): boolean {
  return request.projectId === current.projectId && request.generation === current.generation &&
    typeof value === 'object' && value !== null && (value as { projectId?: unknown }).projectId === current.projectId;
}
