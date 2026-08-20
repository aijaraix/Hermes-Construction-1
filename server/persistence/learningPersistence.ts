import fs from 'fs';
import path from 'path';
import {
  AgentAuditTrace,
  AgentExecutionRecord,
  AgentKnowledgePack,
  CompetencyScenario,
  KnowledgeGapItem,
  LiveLearningActivity,
  ManagerReviewRecord,
  ShadowWorkProposal,
  ValidationResult
} from '../../src/types/hermes';

export interface PersistedLearningStore {
  scenarios: CompetencyScenario[];
  executions: AgentExecutionRecord[];
  validations: ValidationResult[];
  knowledgeGaps: KnowledgeGapItem[];
  managerReviews: ManagerReviewRecord[];
  shadowProposals: ShadowWorkProposal[];
  knowledgePacks: AgentKnowledgePack[];
  auditTraces: AgentAuditTrace[];
  liveActivities: LiveLearningActivity[];
  savedAt: string;
}

export class LearningPersistence {
  private static storePath = path.join(process.cwd(), 'data', 'db', 'hermes_store.json');

  public static saveState(data: Omit<PersistedLearningStore, 'savedAt'>): void {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const storeData: PersistedLearningStore = {
        ...data,
        savedAt: new Date().toISOString()
      };

      fs.writeFileSync(this.storePath, JSON.stringify(storeData, null, 2), 'utf-8');
      console.log(`[PERSISTENCE] Durable learning state persisted to ${this.storePath}`);
    } catch (err: any) {
      console.error('[PERSISTENCE] Error saving learning state to disk:', err?.message);
    }
  }

  public static loadPersistedState(): PersistedLearningStore | null {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
        const data: PersistedLearningStore = JSON.parse(raw);
        console.log(`[PERSISTENCE] Loaded durable learning state from ${this.storePath} (Saved at: ${data.savedAt})`);
        return data;
      }
    } catch (err: any) {
      console.error('[PERSISTENCE] Error loading learning state from disk:', err?.message);
    }
    return null;
  }

  public static existsOnDisk(): boolean {
    return fs.existsSync(this.storePath);
  }
}
