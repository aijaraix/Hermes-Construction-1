import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HermesWorldState } from '../../types/hermes';
import { IMMERSIVE_WORKSPACES, toggleWorkspace, workspaceShortcutTarget, shouldIgnoreGlobalWorkspaceShortcut } from '../immersiveWorkspaceRegistry';
import { deriveProjectOverviewState } from '../projectOverviewState';
import { deriveHumanProjectStatus } from '../humanProjectStatus';
import { isCurrentProjectResponse } from '../projectResponseScope';
import { ProjectOverviewWorkspace } from '../../components/immersive/ProjectOverviewWorkspace';
import { ProjectLauncherRail } from '../../components/immersive/ProjectLauncherRail';
import { HermesProjectProvider } from '../../context/HermesProjectContext';
import { ImmersiveProjectShell } from '../../components/immersive/ImmersiveProjectShell';

export function world(overrides: Partial<HermesWorldState> = {}): HermesWorldState {
  return { projectId: 'project-a', projectName: 'Courtyard House', attemptId: 'attempt-1', currentCheckpoint: 0,
    currentStepIndex: 0, currentPhase: 'INTAKE', currentTask: 'INTAKE_COMPLETE', activeAgents: [], nextTask: 'SITE_SURVEY_CONTROL',
    overallCompletionPct: 0, status: 'PENDING_INTAKE', mode: 'LIVE_PROJECT', projectParams: {}, ...overrides };
}

describe('HX-01 navigation', () => {
  it('exposes exactly eight ordered project tools and a separate developer control', () => {
    expect(IMMERSIVE_WORKSPACES.map(w => w.id)).toEqual(['PROJECT','MODEL','MATERIALS','SCHEDULE','WORKFORCE','LOGISTICS','QUALITY','SYSTEMS']);
    const html = renderToStaticMarkup(<ProjectLauncherRail active={null} onToggle={() => {}} onDeveloper={() => {}} badges={{QUALITY: 3}}/>);
    expect((html.match(/data-workspace=/g) || []).length).toBe(8);
    expect(html).toContain('Developer / System'); expect(html).toContain('Quality &amp; Attention, 3 items');
  });
  it('switches the single primary workspace and toggles it closed', () => {
    const model = toggleWorkspace(null, 'MODEL');
    const materials = toggleWorkspace(model, 'MATERIALS');
    expect(materials).toBe('MATERIALS'); expect(toggleWorkspace(materials, 'MATERIALS')).toBeNull();
  });
  it('maps only Alt+1 through Alt+8', () => {
    expect(IMMERSIVE_WORKSPACES.map((_, i) => workspaceShortcutTarget({ altKey: true, key: String(i + 1) }))).toEqual(IMMERSIVE_WORKSPACES.map(w => w.id));
    for (const key of ['0','9','a','Escape']) expect(workspaceShortcutTarget({ altKey: true, key })).toBeNull();
    expect(workspaceShortcutTarget({ altKey: false, key: '1' })).toBeNull();
  });
  it.each(['INPUT','TEXTAREA','SELECT'])('does not intercept typing in %s', tagName => {
    expect(shouldIgnoreGlobalWorkspaceShortcut({ tagName } as unknown as EventTarget)).toBe(true);
  });
  it('respects editable text and permits canvas shortcuts', () => {
    expect(shouldIgnoreGlobalWorkspaceShortcut({ tagName: 'SPAN', isContentEditable: true } as unknown as EventTarget)).toBe(true);
    expect(shouldIgnoreGlobalWorkspaceShortcut({ tagName: 'CANVAS', isContentEditable: false } as unknown as EventTarget)).toBe(false);
  });
  it('initial shell renders one world canvas and no primary workspace or Prime inspector', () => {
    const html = renderToStaticMarkup(<HermesProjectProvider><ImmersiveProjectShell developerOpen={false} onDeveloperOpen={() => {}} onDeveloperClose={() => {}}/></HermesProjectProvider>);
    expect((html.match(/data-testid="persistent-world-canvas"/g) || []).length).toBe(1);
    expect(html).not.toContain('hx-legacy-inspector'); expect(html).not.toContain('hx-workspace-body');
    expect(html).not.toContain('PRIME / STATUS'); expect(html).toContain('aria-label="Play replay" disabled');
  });
});

describe('HX-01 truth and project isolation', () => {
  it.each([['LIVE_PROJECT','Live Project'],['SIMULATION_GYM','Simulation'],['REGRESSION_TEST','Test Fixture']])('labels %s explicitly', (mode, label) => {
    const overview = deriveProjectOverviewState(world({ mode }));
    expect(overview.project.modeLabel).toBe(label);
    expect(renderToStaticMarkup(<ProjectOverviewWorkspace overview={overview} onOpen={() => {}}/>)).toContain(label);
  });
  it('leaves missing cost and schedule unavailable', () => {
    const overview = deriveProjectOverviewState(world());
    expect(overview.cost).toEqual({ state: 'NOT_CALCULATED' });
    expect(overview.timeline.schedule.availability).toBe('NOT_CALCULATED');
    expect(overview.timeline.schedule.criticalPathDurationDays).toBeUndefined();
    const html = renderToStaticMarkup(<ProjectOverviewWorkspace overview={overview} onOpen={() => {}}/>);
    expect(html).toContain('Not calculated'); expect(html).toContain('No inspection results recorded yet');
    for (const claim of ['82%', '100%', 'Tampa', '0 critical violations', 'Gemini']) expect(html).not.toContain(claim);
  });
  it('does not turn unpriced or partially priced BOM lines into a scoped total', () => {
    const overview = deriveProjectOverviewState(world({ bomItems: [{itemId:'a', quantity:1}, {itemId:'b', extendedCostUSD: 40}] }));
    expect(overview.cost.bomScopedCostUSD).toBeUndefined(); expect(overview.cost.state).toBe('NOT_CALCULATED');
  });
  it('preserves explicit zero costs without taking a truthy fallback', () => {
    const overview = deriveProjectOverviewState(world({ bomItems: [{ itemId: 'a', extendedCostUSD: 0, estimatedTotalCost: 700 }] }));
    expect(overview.cost.bomScopedCostUSD).toBe(0);
  });
  it('derives Done Doing Next without declaring prior phases complete from current phase alone', () => {
    const status = deriveHumanProjectStatus(world({ completedTasks:['INTAKE_COMPLETE'], currentPhase:'SURVEY', activeTaskDetails:{ taskId:'survey-2', title:'Establish control point', assignedAgentId:'a', workLocationXYZ:[1,2,3], requiredEquipment:[], requiredMaterials:[], phase:'SURVEY' } }));
    expect(status.done.latestCompletedLabel).toBe('Validate project brief'); expect(status.doing.label).toBe('Establish control point'); expect(status.next.label).toBe('Establish site survey control');
    expect(status.phaseProgress.find(p => p.phase === 'FEASIBILITY')?.state).toBe('UPCOMING');
  });
  it('does not fabricate completion when the current record omits it', () => {
    expect(deriveHumanProjectStatus(world({ overallCompletionPct: undefined })).completionPct).toBeUndefined();
  });
  it('does not treat internal inspection records as external approval', () => {
    const overview = deriveProjectOverviewState(world({ inspectionTickets:[{ticketId:'i',status:'PASS',licensedProfessionalApproval:'PENDING',AHJInspection:'PENDING_CITY_INSPECTION'}] }));
    expect(overview.quality.professionalReviewPendingCount).toBe(1); expect(overview.quality.ahjPendingCount).toBe(1);
    expect(overview.quality.summaryLabel).toBe('HERMES checks recorded; external approvals remain');
  });
  it('rejects old and foreign responses, including A→B→A races', () => {
    expect(isCurrentProjectResponse({projectId:'a',generation:1},{projectId:'a',generation:1},{projectId:'a'})).toBe(true);
    expect(isCurrentProjectResponse({projectId:'a',generation:1},{projectId:'b',generation:2},{projectId:'a'})).toBe(false);
    expect(isCurrentProjectResponse({projectId:'a',generation:1},{projectId:'a',generation:3},{projectId:'a'})).toBe(false);
    expect(isCurrentProjectResponse({projectId:'a',generation:3},{projectId:'a',generation:3},{projectId:'b'})).toBe(false);
  });
});
