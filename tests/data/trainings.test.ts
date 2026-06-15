import { describe, it, expect } from 'vitest';
import { trainings, type ModuleId } from '@/data/trainings';

describe('trainings catalogue', () => {
  it('Basic is a 2-day training with 11 modules split 6 / 5 across two days', () => {
    const basic = trainings.basic;
    expect(basic.durationDays).toBe(2);
    expect(basic.priceEUR).toBe(1399);

    const expected: { id: ModuleId; day: 1 | 2 }[] = [
      { id: 'agents-in-sdlc', day: 1 },
      { id: 'failure-modes-ai-code', day: 1 },
      { id: 'test-first-with-agents', day: 1 },
      { id: 'hooks-and-quality-gates', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'regression-and-governance', day: 1 },
      { id: 'context-architecture', day: 2 },
      { id: 'context-window-mechanics', day: 2 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
      { id: 'capstone-ship-feature', day: 2 },
    ];

    expect(basic.modules).toEqual(expected);
  });

  it('only the pilot carries a fixed online schedule (ISO dates for structured data)', () => {
    expect(trainings.pilot.schedule).toEqual({
      startDate: '2026-06-29',
      endDate: '2026-06-30',
      courseMode: 'online',
    });
    expect(trainings.basic.schedule).toBeUndefined();
    expect(trainings.advanced.schedule).toBeUndefined();
  });

  it('Advanced is a 1-day training with 5 modules and no day tags', () => {
    const adv = trainings.advanced;
    expect(adv.durationDays).toBe(1);
    expect(adv.priceEUR).toBe(999);

    const expected: { id: ModuleId }[] = [
      { id: 'team-rollout-playbook' },
      { id: 'agent-harnessing' },
      { id: 'governance-and-policy-gates' },
      { id: 'observability-and-cost' },
      { id: 'capstone-rollout-tabletop' },
    ];

    expect(adv.modules).toEqual(expected);
  });

  it('both trainings still support all 3 delivery formats', () => {
    for (const t of Object.values(trainings)) {
      expect(t.deliveryFormats).toEqual(['inCompany', 'publicCohort', 'remote']);
    }
  });
});
