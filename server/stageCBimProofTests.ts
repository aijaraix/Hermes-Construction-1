import { BimCommandEngine } from './bimCommandEngine';
import { BimProofRunner } from './bimProofRunner';
import { MaterialsKnowledgeEngine } from './materialsKnowledgeEngine';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export class StageCBimProofTests {
  public static runAllTests(): { total: number; passed: number; failed: number; results: TestResult[] } {
    const results: TestResult[] = [];
    MaterialsKnowledgeEngine.initialize();

    // Test 1: New BIM project begins empty
    const test1Id = `TEST-PROJ-EMPTY-${Date.now()}`;
    BimCommandEngine.initializeProject(test1Id, 'ATTEMPT-TEST');
    const initialComps = BimCommandEngine.getCanonicalProjectComponents(test1Id);
    const initialRevs = BimCommandEngine.getRevisionHistory(test1Id);

    results.push({
      name: 'New BIM Project Begins Empty',
      passed: initialComps.length === 0 && initialRevs.length === 1 && initialRevs[0].description.includes('Empty State'),
      message: `Project ${test1Id} initialized with ${initialComps.length} components and ${initialRevs.length} revision.`
    });

    // Test 2: BIM command creates actual canonical object
    const wallCmd = BimCommandEngine.executeCommand({
      commandType: 'CREATE_WALL',
      agentId: 'WOOD-FRAMING-AGENT',
      taskId: 'TASK-TEST-WALL',
      projectId: test1Id,
      attemptId: 'ATTEMPT-TEST',
      params: {
        startPos: [0, 0, 0],
        endPos: [4, 0, 0],
        thicknessMeters: 0.15,
        heightMeters: 3.0,
        assemblySpecId: 'ASSY-WALL-EXT-WOOD-R21',
        materialSpecIds: ['MAT-WOOD-SPF-NO2', 'MAT-GYP-TYPEX-58']
      }
    });

    const compsAfterWall = BimCommandEngine.getCanonicalProjectComponents(test1Id);
    const createdWall = compsAfterWall.find(c => c.id === wallCmd.createdModifiedObjectIds[0]);

    results.push({
      name: 'BIM Command Creates Canonical Wall Entity',
      passed: wallCmd.validationResult.passed && !!createdWall && createdWall.ifcType === 'IfcWallStandardCase',
      message: `Created wall ${createdWall?.id} with IFC type ${createdWall?.ifcType}`
    });

    // Test 3: Wall dimensions persist and match geometry
    results.push({
      name: 'Wall Dimensions Persist and Match Geometry',
      passed: !!createdWall && createdWall.geometry.dimensions[2] === 4.0 && createdWall.geometry.dimensions[1] === 3.0,
      message: `Wall length ${createdWall?.geometry.dimensions[2]}m, height ${createdWall?.geometry.dimensions[1]}m`
    });

    // Test 4: Wall assembly references Materials Knowledge Graph
    results.push({
      name: 'Wall Assembly References Materials Graph',
      passed: !!createdWall && createdWall.materialSpecIds?.includes('MAT-WOOD-SPF-NO2') === true,
      message: `Material spec IDs: ${createdWall?.materialSpecIds?.join(', ')}`
    });

    // Test 5: Door hosted in wall maintains relationship
    const doorCmd = BimCommandEngine.executeCommand({
      commandType: 'CREATE_DOOR',
      agentId: 'WOOD-FRAMING-AGENT',
      taskId: 'TASK-TEST-DOOR',
      projectId: test1Id,
      attemptId: 'ATTEMPT-TEST',
      params: {
        hostWallId: createdWall?.id || '',
        offsetAlongWallMeters: 0,
        widthMeters: 0.9,
        heightMeters: 2.1
      }
    });

    const compsAfterDoor = BimCommandEngine.getCanonicalProjectComponents(test1Id);
    const createdDoor = compsAfterDoor.find(c => c.id === doorCmd.createdModifiedObjectIds[0]);
    const updatedWall = compsAfterDoor.find(c => c.id === createdWall?.id);

    results.push({
      name: 'Door Hosted in Wall Maintains Topological Relationship',
      passed: !!createdDoor && createdDoor.hostWallId === createdWall?.id && updatedWall?.openings.includes(createdDoor.id) === true,
      message: `Door ${createdDoor?.id} hosted in wall ${createdDoor?.hostWallId}`
    });

    // Test 6: Pipe connectivity graph derived
    const pipeCmd = BimCommandEngine.executeCommand({
      commandType: 'CREATE_PIPE_SEGMENT',
      agentId: 'PLUMBING-DWV-AGENT',
      taskId: 'TASK-TEST-PIPE',
      projectId: test1Id,
      attemptId: 'ATTEMPT-TEST',
      params: {
        startPos: [0, 0, 0],
        endPos: [2, 0, 0],
        diameterInches: 2.0,
        materialSpecId: 'MAT-POLYMERS-PVC-SCH40'
      }
    });

    const pipeId = pipeCmd.createdModifiedObjectIds[0];

    const fitCmd = BimCommandEngine.executeCommand({
      commandType: 'CREATE_PIPE_FITTING',
      agentId: 'PLUMBING-DWV-AGENT',
      taskId: 'TASK-TEST-FIT',
      projectId: test1Id,
      attemptId: 'ATTEMPT-TEST',
      params: {
        position: [2, 0, 0],
        fittingType: '90-Degree Elbow',
        connectToPipeIds: [pipeId]
      }
    });

    const compsAfterFit = BimCommandEngine.getCanonicalProjectComponents(test1Id);
    const createdPipe = compsAfterFit.find(c => c.id === pipeId);
    const fittingId = fitCmd.createdModifiedObjectIds[0];
    const createdFit = compsAfterFit.find(c => c.id === fittingId);

    const pipeConnectedToFit = createdPipe ? createdPipe.connectedComponentIds.includes(fittingId) : false;
    const fitConnectedToPipe = createdFit ? createdFit.connectedComponentIds.includes(pipeId) : false;

    results.push({
      name: 'Pipe Fitting Graph Connectivity Derived',
      passed: pipeConnectedToFit && fitConnectedToPipe,
      message: `Pipe ${pipeId} connected to fitting ${fittingId} (PipeConn: ${pipeConnectedToFit}, FitConn: ${fitConnectedToPipe})`
    });

    // Test 7: Full Stage C Proof Runner Execution
    const stageCReport = BimProofRunner.executeStageCProof();

    results.push({
      name: 'Full Stage C Proof Runner Execution',
      passed: stageCReport.DECLARATIONS.STAGE_C_BIM_PROOF_PASS === 'YES' && stageCReport.SAVE_RELOAD_VERIFIED && stageCReport.IFC_EXPORT_VERIFIED,
      message: `Stage C Pass: ${stageCReport.DECLARATIONS.STAGE_C_BIM_PROOF_PASS}, Save/Reload: ${stageCReport.SAVE_RELOAD_VERIFIED}, IFC Export: ${stageCReport.IFC_EXPORT_VERIFIED}`
    });

    // Test 8: Stage F Apartment Training Remains Locked Until Stage C Passes
    results.push({
      name: 'Stage F Apartment Training Remains Locked During Stage C Proof',
      passed: stageCReport.DECLARATIONS.GYM_APT_1BR_0001_STARTED === 'NO',
      message: `GYM-APT-1BR-0001 Started: ${stageCReport.DECLARATIONS.GYM_APT_1BR_0001_STARTED}`
    });

    const passedCount = results.filter(r => r.passed).length;

    return {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      results
    };
  }
}
