import fs from 'fs';
import path from 'path';
import {
  HermesSystemState,
  DigitalTwinProject,
  TaskGraphNode,
  SwarmAgentEntity,
  KnowledgeEntity,
  LearnedLesson,
  AssemblyPattern,
} from '../../src/types/hermes';

const DATA_DIR = path.join(process.cwd(), 'data', 'db');
const STORE_FILE = path.join(DATA_DIR, 'hermes_store.json');

export interface HermesDurableStoreData {
  systemState: HermesSystemState;
  projects: Record<string, DigitalTwinProject>;
  tasks: Record<string, TaskGraphNode[]>; // projectId -> tasks
  agents: SwarmAgentEntity[];
  knowledgeEntities: KnowledgeEntity[];
  learnedLessons: LearnedLesson[];
  assemblyPatterns: AssemblyPattern[];
  activityLogs: Array<{
    id: string;
    timestamp: string;
    swarm: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export function ensureDataDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function saveDurableStore(data: HermesDurableStoreData): void {
  try {
    ensureDataDirectoryExists();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[HERMES PERSISTENCE] Failed to save durable store:', err);
  }
}

export function loadDurableStore(): HermesDurableStoreData | null {
  try {
    ensureDataDirectoryExists();
    if (!fs.existsSync(STORE_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw) as HermesDurableStoreData;
  } catch (err) {
    console.error('[HERMES PERSISTENCE] Failed to load durable store:', err);
    return null;
  }
}

export class PersistenceStore {
  public static getJSON<T>(filename: string): T | null {
    try {
      ensureDataDirectoryExists();
      const filePath = path.join(DATA_DIR, filename);
      if (!fs.existsSync(filePath)) return null;
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public static setJSON<T>(filename: string, data: T): void {
    try {
      ensureDataDirectoryExists();
      const filePath = path.join(DATA_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`[PERSISTENCE STORE] Failed to write ${filename}:`, e);
    }
  }
}

