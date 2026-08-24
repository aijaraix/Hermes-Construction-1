import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import {
  DigitalTwinProject,
  TaskGraphNode,
  SwarmAgentEntity,
  HeartbeatRecord,
  TaskExecutionRecord,
  ModelRevisionRecord,
  InspectionAuditRecord,
  BOMRevisionRecord,
  DecisionLogRecord,
  ProjectEventRecord,
  KnowledgeEntity,
  LearnedLesson,
  CorpusSourceItem,
  CompetencyMatrix,
  HermesSystemState,
} from '../../src/types/hermes';

const DATA_DIR = path.join(process.cwd(), 'data', 'db');
const SQLITE_FILE = path.join(DATA_DIR, 'hermes_sqlite.db');

export class HermesSqliteAdapter {
  private db: Database | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const SQL = await initSqlJs();

    if (fs.existsSync(SQLITE_FILE)) {
      try {
        const buffer = fs.readFileSync(SQLITE_FILE);
        this.db = new SQL.Database(buffer);
        this.createTables();
      } catch (err) {
        console.warn('[HERMES SQLITE] Existing DB file was corrupted or malformed. Resetting database:', err);
        if (fs.existsSync(SQLITE_FILE)) {
          try { fs.unlinkSync(SQLITE_FILE); } catch (_) {}
        }
        this.db = new SQL.Database();
        this.createTables();
      }
    } else {
      this.db = new SQL.Database();
      this.createTables();
    }

    this.saveToFile();
    this.isInitialized = true;
    console.log('[HERMES SQLITE] Initialized SQLite Database Engine.');
  }

  private saveToFile(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(SQLITE_FILE, buffer);
    } catch (err) {
      console.error('[HERMES SQLITE] Failed to export database to disk:', err);
    }
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_state (
        system_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gym_level INTEGER NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        stage TEXT NOT NULL,
        status TEXT NOT NULL,
        assigned_agent_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        swarm_group TEXT NOT NULL,
        specialty TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS heartbeats (
        heartbeat_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        project TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_execution_records (
        task_id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        trade TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS model_revision_records (
        revision TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        project TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inspection_audit_records (
        inspection_id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        inspector TEXT NOT NULL,
        final_status TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bom_revision_records (
        bom_revision_id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decision_log_records (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge_entities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learned_lessons (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS corpus_sources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authority TEXT NOT NULL,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS competency_matrix (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fetched_documents (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        checksum TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        document_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge_assertions (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        source_chunk_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS agent_curricula (
        agent_role_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS agent_knowledge_packs (
        pack_id TEXT PRIMARY KEY,
        agent_role_id TEXT NOT NULL,
        version TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS competency_test_results (
        result_id TEXT PRIMARY KEY,
        agent_role_id TEXT NOT NULL,
        passed INTEGER NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge_contradictions (
        contradiction_id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learning_reports (
        report_id TEXT PRIMARY KEY,
        agent_role_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS project_events (
        event_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        attempt_id TEXT,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        agent_id TEXT,
        data TEXT NOT NULL
      );
    `);
  }

  // Helper to execute writes safely
  private safeRun(sql: string, params: any[]): void {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(params);
      stmt.free();
      this.saveToFile();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Execution error:', err?.message || err);
      if (err?.message?.includes('malformed')) {
        this.resetCorruptedDb();
      }
    }
  }

  private resetCorruptedDb(): void {
    console.warn('[HERMES SQLITE] Re-initializing database after malformed disk error...');
    try {
      if (fs.existsSync(SQLITE_FILE)) {
        fs.unlinkSync(SQLITE_FILE);
      }
    } catch (_) {}
    this.isInitialized = false;
    this.init().catch((err) => console.error('[HERMES SQLITE] Reset init failed:', err));
  }

  // System State Operations
  public saveSystemState(state: HermesSystemState): void {
    this.safeRun(
      `INSERT OR REPLACE INTO system_state (system_id, data, updated_at) VALUES (?, ?, ?)`,
      [state.system_id, JSON.stringify(state), new Date().toISOString()]
    );
  }

  public getSystemState(): HermesSystemState | null {
    if (!this.db) return null;
    try {
      const stmt = this.db.prepare(`SELECT data FROM system_state LIMIT 1`);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return JSON.parse(row.data as string) as HermesSystemState;
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading system state:', err?.message || err);
    }
    return null;
  }

  // Projects Operations
  public saveProject(project: DigitalTwinProject): void {
    this.safeRun(
      `INSERT OR REPLACE INTO projects (id, name, gym_level, status, data, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        project.id,
        project.name,
        project.gymLevel,
        project.status,
        JSON.stringify(project),
        new Date().toISOString(),
      ]
    );
  }

  public getProject(id: string): DigitalTwinProject | null {
    if (!this.db) return null;
    try {
      const stmt = this.db.prepare(`SELECT data FROM projects WHERE id = ?`);
      stmt.bind([id]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return JSON.parse(row.data as string) as DigitalTwinProject;
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading project:', err?.message || err);
    }
    return null;
  }

  public getAllProjects(): DigitalTwinProject[] {
    if (!this.db) return [];
    const results: DigitalTwinProject[] = [];
    try {
      const stmt = this.db.prepare(`SELECT data FROM projects ORDER BY updated_at DESC`);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading all projects:', err?.message || err);
    }
    return results;
  }

  // Heartbeat Records
  public insertHeartbeatRecord(record: HeartbeatRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO heartbeats (heartbeat_id, timestamp, project, data) VALUES (?, ?, ?, ?)`,
      [record.heartbeat_id, record.timestamp, record.project, JSON.stringify(record)]
    );
  }

  public getHeartbeatRecords(limit: number = 50): HeartbeatRecord[] {
    if (!this.db) return [];
    const results: HeartbeatRecord[] = [];
    try {
      const stmt = this.db.prepare(`SELECT data FROM heartbeats ORDER BY timestamp DESC LIMIT ?`);
      stmt.bind([limit]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading heartbeat records:', err?.message || err);
    }
    return results;
  }

  // Task Executions
  public insertTaskExecutionRecord(record: TaskExecutionRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO task_execution_records (task_id, project, trade, data, created_at) VALUES (?, ?, ?, ?, ?)`,
      [record.task_id, record.project, record.trade, JSON.stringify(record), record.created_at]
    );
  }

  public getTaskExecutionRecords(projectId?: string): TaskExecutionRecord[] {
    if (!this.db) return [];
    const results: TaskExecutionRecord[] = [];
    try {
      const sql = projectId
        ? `SELECT data FROM task_execution_records WHERE project = ? ORDER BY created_at DESC`
        : `SELECT data FROM task_execution_records ORDER BY created_at DESC LIMIT 100`;
      const stmt = this.db.prepare(sql);
      if (projectId) stmt.bind([projectId]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading task execution records:', err?.message || err);
    }
    return results;
  }

  // Model Revision Records
  public insertModelRevisionRecord(record: ModelRevisionRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO model_revision_records (revision, timestamp, project, data) VALUES (?, ?, ?, ?)`,
      [record.revision, record.timestamp, record.project, JSON.stringify(record)]
    );
  }

  public getModelRevisionRecords(projectId?: string): ModelRevisionRecord[] {
    if (!this.db) return [];
    const results: ModelRevisionRecord[] = [];
    try {
      const sql = projectId
        ? `SELECT data FROM model_revision_records WHERE project = ? ORDER BY timestamp DESC`
        : `SELECT data FROM model_revision_records ORDER BY timestamp DESC LIMIT 100`;
      const stmt = this.db.prepare(sql);
      if (projectId) stmt.bind([projectId]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading model revision records:', err?.message || err);
    }
    return results;
  }

  // Inspection Audit Records
  public insertInspectionAuditRecord(record: InspectionAuditRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO inspection_audit_records (inspection_id, project, inspector, final_status, data) VALUES (?, ?, ?, ?, ?)`,
      [record.inspection_id, record.project, record.inspector, record.final_status, JSON.stringify(record)]
    );
  }

  public getInspectionAuditRecords(projectId?: string): InspectionAuditRecord[] {
    if (!this.db) return [];
    const results: InspectionAuditRecord[] = [];
    try {
      const sql = projectId
        ? `SELECT data FROM inspection_audit_records WHERE project = ? ORDER BY inspection_id DESC`
        : `SELECT data FROM inspection_audit_records ORDER BY inspection_id DESC LIMIT 100`;
      const stmt = this.db.prepare(sql);
      if (projectId) stmt.bind([projectId]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading inspection audit records:', err?.message || err);
    }
    return results;
  }

  // BOM Revision Records
  public insertBOMRevisionRecord(record: BOMRevisionRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO bom_revision_records (bom_revision_id, project, timestamp, data) VALUES (?, ?, ?, ?)`,
      [record.bom_revision_id, record.project, record.timestamp, JSON.stringify(record)]
    );
  }

  public getBOMRevisionRecords(projectId?: string): BOMRevisionRecord[] {
    if (!this.db) return [];
    const results: BOMRevisionRecord[] = [];
    try {
      const sql = projectId
        ? `SELECT data FROM bom_revision_records WHERE project = ? ORDER BY timestamp DESC`
        : `SELECT data FROM bom_revision_records ORDER BY timestamp DESC LIMIT 100`;
      const stmt = this.db.prepare(sql);
      if (projectId) stmt.bind([projectId]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading BOM revision records:', err?.message || err);
    }
    return results;
  }

  // Decision Logs
  public insertDecisionLog(record: DecisionLogRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO decision_log_records (id, project_id, timestamp, data) VALUES (?, ?, ?, ?)`,
      [record.id, record.projectId, record.timestamp, JSON.stringify(record)]
    );
  }

  public getDecisionLogs(projectId?: string): DecisionLogRecord[] {
    if (!this.db) return [];
    const results: DecisionLogRecord[] = [];
    try {
      const sql = projectId
        ? `SELECT data FROM decision_log_records WHERE project_id = ? ORDER BY timestamp DESC`
        : `SELECT data FROM decision_log_records ORDER BY timestamp DESC LIMIT 100`;
      const stmt = this.db.prepare(sql);
      if (projectId) stmt.bind([projectId]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading decision logs:', err?.message || err);
    }
    return results;
  }

  // Project Event Records
  public insertProjectEvent(event: ProjectEventRecord): void {
    this.safeRun(
      `INSERT OR REPLACE INTO project_events (event_id, project_id, attempt_id, event_type, timestamp, agent_id, data) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event.eventId, event.projectId, event.attemptId || '', event.eventType, event.timestamp, event.agentId || '', JSON.stringify(event)]
    );
  }

  public getProjectEvents(projectId: string, attemptId?: string): ProjectEventRecord[] {
    if (!this.db) return [];
    const results: ProjectEventRecord[] = [];
    try {
      const sql = attemptId
        ? `SELECT data FROM project_events WHERE project_id = ? AND attempt_id = ? ORDER BY timestamp ASC`
        : `SELECT data FROM project_events WHERE project_id = ? ORDER BY timestamp ASC`;
      const stmt = this.db.prepare(sql);
      if (attemptId) {
        stmt.bind([projectId, attemptId]);
      } else {
        stmt.bind([projectId]);
      }
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(JSON.parse(row.data as string));
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading project events:', err?.message || err);
    }
    return results;
  }

  // Competency Matrix
  public saveCompetencyMatrix(matrix: CompetencyMatrix): void {
    this.safeRun(
      `INSERT OR REPLACE INTO competency_matrix (id, data, last_updated) VALUES (?, ?, ?)`,
      ['GLOBAL_HERMES_MATRIX', JSON.stringify(matrix), matrix.lastUpdated]
    );
  }

  public getCompetencyMatrix(): CompetencyMatrix | null {
    if (!this.db) return null;
    try {
      const stmt = this.db.prepare(`SELECT data FROM competency_matrix WHERE id = 'GLOBAL_HERMES_MATRIX'`);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return JSON.parse(row.data as string) as CompetencyMatrix;
      }
      stmt.free();
    } catch (err: any) {
      console.error('[HERMES SQLITE] Error reading competency matrix:', err?.message || err);
    }
    return null;
  }
}

export const sqliteAdapter = new HermesSqliteAdapter();
