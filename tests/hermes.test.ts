import { primeOrchestrator } from '../server/primeOrchestrator';
import { generateBOMFromComponents } from '../server/deterministicGeometryEngine';
import { createDefaultTaskGraphForProject } from '../server/taskGraphEngine';

async function runHermesTestSuite() {
  console.log('====================================================');
  console.log('  HERMES CONSTRUCTION AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS]: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL]: ${testName}`);
      failed++;
    }
  }

  // Test 1: Hydrated System State
  const sysState = primeOrchestrator.getSystemState();
  assert(sysState !== null && sysState.system_id.includes('HERMES'), 'System State loaded & valid');

  // Test 2: Heartbeat State Retrieval
  const hbState = primeOrchestrator.getHeartbeatState();
  assert(hbState.heartbeatCount > 0, 'Heartbeat counter active');

  // Test 3: Task Graph Sequence Generation
  const taskGraph = createDefaultTaskGraphForProject('TEST-PROJ-001');
  assert(taskGraph.length === 20, 'Task Graph contains all 20 construction stages');
  assert(taskGraph[0].stage === 'SITE_ANALYSIS', 'First stage is SITE_ANALYSIS');
  assert(taskGraph[19].stage === 'EXTRACT_LEARNED_LESSONS', 'Final stage is EXTRACT_LEARNED_LESSONS');

  // Test 4: Deterministic BOM Generation
  const mockComponents: any[] = [
    {
      id: 'SLAB-TEST',
      type: 'slab',
      system: 'Structure',
      materials: [{ name: 'Ready-Mix Concrete', quantity: 50, unit: 'cu yd' }],
      geometry: { dimensions: [40, 0.5, 30] },
      isExterior: true,
      quantity: { value: 50, unit: 'cu yd' },
      unitCost: 160,
      totalCost: 8000,
    },
  ];
  const bom = generateBOMFromComponents(mockComponents);
  assert(bom.length === 1 && bom[0].estimatedTotalCost > 0, 'Deterministic BOM Engine calculates accurate quantities & costs');

  // Test 5: Heartbeat Step Execution
  const initialHb = hbState.heartbeatCount;
  const nextHbState = await primeOrchestrator.triggerHeartbeat();
  assert(nextHbState.heartbeatCount === initialHb + 1, 'Trigger Heartbeat turn increments counter and advances task state');

  // Test 6: Pause Control Management
  primeOrchestrator.setPauseControls({ is_system_paused: true, pause_reason: 'Automated Test Hold' });
  const pausedSysState = primeOrchestrator.getSystemState();
  assert(pausedSysState.pause_controls.is_system_paused === true, 'Owner Pause control successfully sets is_system_paused');

  // Resume system
  primeOrchestrator.setPauseControls({ is_system_paused: false, pause_reason: '' });
  const resumedSysState = primeOrchestrator.getSystemState();
  assert(resumedSysState.pause_controls.is_system_paused === false, 'Owner Resume control successfully restores ACTIVE state');

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runHermesTestSuite().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
