import fs from 'fs';
import path from 'path';
import {
  DataTruthRecord,
  DomainConflictRecord,
  PageAuditSummary,
  RealityRepairRecord,
} from './realitySwarmEngine';
import { SecurityExposureReport } from './securityScanner';

export interface AuditExecutionRecord {
  auditExecutionId: string;
  agentId: string;
  auditType: string;
  target: string;
  recordsInspected: number;
  findingsCount: number;
  actionsTaken: string[];
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
}

export interface RealityStoreData {
  truthRecords: DataTruthRecord[];
  repairLogs: RealityRepairRecord[];
  domainConflicts: DomainConflictRecord[];
  securityExposures: SecurityExposureReport;
  pageAudits: PageAuditSummary[];
  auditExecutions: AuditExecutionRecord[];
  lastSavedAt: string;
}

export class RealityStore {
  private static dbPath = path.join(process.cwd(), 'data', 'db', 'reality_audit_store.json');

  public static load(): RealityStoreData | null {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw) as RealityStoreData;
      }
    } catch (err) {
      console.warn('[REALITY STORE] Failed to load store from disk:', err);
    }
    return null;
  }

  public static save(data: Omit<RealityStoreData, 'lastSavedAt'>): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const payload: RealityStoreData = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };

      fs.writeFileSync(this.dbPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[REALITY STORE] Failed to save store to disk:', err);
    }
  }
}
