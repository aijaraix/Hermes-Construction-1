import fs from 'fs';
import path from 'path';
import { AuthoritativeSourceDefinition } from '../src/types/hermes';

export class SourceRegistry {
  private static sources: AuthoritativeSourceDefinition[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    try {
      const jsonPath = path.join(process.cwd(), 'data', 'source-registry', 'authoritative-construction-sources.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        this.sources = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load source registry JSON:', e);
    }

    this.initialized = true;
  }

  public static getAllSources(): AuthoritativeSourceDefinition[] {
    this.initialize();
    return [...this.sources];
  }

  public static getSource(sourceId: string): AuthoritativeSourceDefinition | undefined {
    this.initialize();
    return this.sources.find(s => s.sourceId === sourceId);
  }

  public static addSource(source: AuthoritativeSourceDefinition): void {
    this.initialize();
    this.sources.push(source);
  }
}
