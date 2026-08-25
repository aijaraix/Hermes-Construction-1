import { House0002Engine } from './house0002Engine';
import { House0002CheckpointRunner } from './house0002CheckpointRunner';

console.log('--- STARTING ACADEMY-HOUSE-0002 ATTEMPT-01 EXECUTION RECOVERY ---');
House0002Engine.initialize();
House0002Engine.setPaused(false);

const initialEventCount = House0002Engine.getEventStream().length;
console.log(`Initial Event Count: ${initialEventCount}`);

console.log('Stepping continuous execution loop 25 times...');
for (let i = 0; i < 25; i++) {
  const stepRes = House0002Engine.stepAutonomousExecution();
  console.log(`Step ${stepRes.step}: Total Events = ${stepRes.eventCount}, New Event = ${stepRes.newEvent?.eventType}`);
}

const finalEventCount = House0002Engine.getEventStream().length;
console.log(`Final Event Count: ${finalEventCount} (+${finalEventCount - initialEventCount} new events)`);

const checkpointReport = House0002CheckpointRunner.executeCheckpointReport();
console.log('\n================ CHECKPOINT REPORT SUMMARY ================');
console.log(`PROJECT_ID: ${checkpointReport.PROJECT_ID}`);
console.log(`ATTEMPT_ID: ${checkpointReport.ATTEMPT_ID}`);
console.log(`BIM_COMPONENT_COUNT: ${checkpointReport.BIM_COMPONENT_COUNT}`);
console.log(`TOTAL_EVENTS: ${checkpointReport.PROJECT_EVENTS.length}`);
console.log(`TRUTH DECLARATIONS:`, JSON.stringify(checkpointReport.TRUTH_DECLARATIONS, null, 2));
console.log('===========================================================\n');

House0002Engine.setPaused(true);
console.log('Execution recovery demo completed. System paused awaiting owner review.');
