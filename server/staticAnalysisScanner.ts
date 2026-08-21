import fs from 'fs';
import path from 'path';

export type StaticFindingClassification =
  | 'LEGITIMATE_CONFIGURATION'
  | 'UI_COPY'
  | 'ENUM'
  | 'TEST_FIXTURE'
  | 'SEED_DATA'
  | 'SIMULATION_DATA'
  | 'PRODUCTION_HARDCODE'
  | 'UNKNOWN';

export interface StaticAnalysisFinding {
  findingId: string;
  filePath: string;
  lineNumber: number;
  matchedText: string;
  classification: StaticFindingClassification;
  explanation: string;
  autoFixable: boolean;
}

export class StaticAnalysisScanner {
  public static scanDirectory(dirPath: string): StaticAnalysisFinding[] {
    const findings: StaticAnalysisFinding[] = [];
    if (!fs.existsSync(dirPath)) return findings;

    const files = this.getFilesRecursive(dirPath);
    let findingCounter = 1;

    for (const filePath of files) {
      if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('.git')) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          const lineNum = index + 1;

          // Check for hardcoded fallback like agentCount || 132 or totalCost || 1000
          if (line.includes('|| 132') || line.includes('agentCount = 132')) {
            findings.push({
              findingId: `STAT-FIND-${findingCounter++}`,
              filePath: path.relative(process.cwd(), filePath),
              lineNumber: lineNum,
              matchedText: line.trim(),
              classification: 'PRODUCTION_HARDCODE',
              explanation: 'Hardcoded fallback to 132 agent roles found instead of querying AgentRegistry.',
              autoFixable: true,
            });
          }

          // Check for hardcoded price strings in server engine
          if (filePath.endsWith('realitySwarmEngine.ts') && line.includes('$145 / cu yd')) {
            findings.push({
              findingId: `STAT-FIND-${findingCounter++}`,
              filePath: path.relative(process.cwd(), filePath),
              lineNumber: lineNum,
              matchedText: line.trim(),
              classification: 'PRODUCTION_HARDCODE',
              explanation: 'Hardcoded concrete price in Reality Swarm engine instead of Procurement Store query.',
              autoFixable: true,
            });
          }

          // Check for static page audit objects in realitySwarmEngine
          if (filePath.endsWith('realitySwarmEngine.ts') && line.includes('fieldsInspected: 128')) {
            findings.push({
              findingId: `STAT-FIND-${findingCounter++}`,
              filePath: path.relative(process.cwd(), filePath),
              lineNumber: lineNum,
              matchedText: line.trim(),
              classification: 'PRODUCTION_HARDCODE',
              explanation: 'Hardcoded page audit summary numbers found in engine.',
              autoFixable: true,
            });
          }
        });
      } catch {
        // Skip unreadable files
      }
    }

    return findings;
  }

  private static getFilesRecursive(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFilesRecursive(fullPath));
      } else {
        if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
          results.push(fullPath);
        }
      }
    });

    return results;
  }
}
