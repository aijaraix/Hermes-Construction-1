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
    const tmpPath = `${STORE_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_FILE);
  } catch (err: any) {
    console.error('[HERMES PERSISTENCE] Failed to save durable store:', err?.message || String(err));
  }
}

function sanitizeJsonStringLiterals(json: string): string {
  let inString = false;
  let result = '';

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    const code = char.charCodeAt(0);

    if (inString) {
      if (char === '"') {
        result += char;
        inString = false;
      } else if (char === '\\') {
        const next = json[i + 1];
        if (next && '"\\/bfnrt'.includes(next)) {
          result += char + next;
          i++;
        } else if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(json.slice(i + 2, i + 6))) {
          result += json.slice(i, i + 6);
          i += 5;
        } else {
          // Invalid escape sequence like \P, \z, or trailing \ -> escape as \\
          result += '\\\\';
        }
      } else if (code < 0x20) {
        switch (char) {
          case '\n': result += '\\n'; break;
          case '\r': result += '\\r'; break;
          case '\t': result += '\\t'; break;
          case '\b': result += '\\b'; break;
          case '\f': result += '\\f'; break;
          default:
            result += `\\u${code.toString(16).padStart(4, '0')}`;
            break;
        }
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }
  return result;
}

export function safeJsonParse<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    const sanitized = sanitizeJsonStringLiterals(jsonString);
    return JSON.parse(sanitized) as T;
  }
}

export function loadDurableStore(): HermesDurableStoreData | null {
  try {
    ensureDataDirectoryExists();
    if (!fs.existsSync(STORE_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return safeJsonParse<HermesDurableStoreData>(raw);
  } catch {
    console.warn('[HERMES PERSISTENCE] Store file is corrupted or unreadable. Starting fresh.');
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
      return safeJsonParse<T>(raw);
    } catch {
      return null;
    }
  }

  public static setJSON<T>(filename: string, data: T): void {
    try {
      ensureDataDirectoryExists();
      const filePath = path.join(DATA_DIR, filename);
      const tmpPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, filePath);
    } catch (e: any) {
      console.error(`[PERSISTENCE STORE] Failed to write ${filename}:`, e?.message || String(e));
    }
  }
}

