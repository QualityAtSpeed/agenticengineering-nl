import { describe, it, expect } from 'vitest';
import { trainings, type ModuleId } from '@/data/trainings';

describe('trainings catalogue', () => {
  it('Basic is a 2-day training with 20 modules split 10 / 10 across two days', () => {
    const basic = trainings.basic;
    expect(basic.durationDays).toBe(2);
    expect(basic.priceEUR).toBe(999);

    const expected: { id: ModuleId; day: 1 | 2 }[] = [
      // Day 1 — fundamentals: from concept to first tooling
      { id: 'agentic-engineering', day: 1 },
      { id: 'assignment-hobby-page', day: 1 },
      { id: 'context-architecture', day: 1 },
      { id: 'assignment-expand-website', day: 1 },
      { id: 'assignment-tone-of-voice', day: 1 },
      { id: 'out-of-the-loop', day: 1 },
      { id: 'intro-skills-rules', day: 1 },
      { id: 'assignment-create-skill', day: 1 },
      { id: 'using-mcp-servers', day: 1 },
      { id: 'plugins-caveman-superpowers', day: 1 },
      // Day 2 — quality & advanced
      { id: 'failure-modes-ai-code', day: 2 },
      { id: 'test-first-with-agents', day: 2 },
      { id: 'subagents', day: 2 },
      { id: 'hooks-and-quality-gates', day: 2 },
      { id: 'build-first-feature', day: 2 },
      { id: 'building-a-pipeline', day: 2 },
      { id: 'persistent-memory', day: 2 },
      { id: 'openspec', day: 2 },
      { id: 'regression-and-governance', day: 2 },
      { id: 'capstone-ship-feature', day: 2 },
    ];

    expect(basic.modules).toEqual(expected);
    expect(basic.modules.filter((m) => m.day === 1)).toHaveLength(10);
    expect(basic.modules.filter((m) => m.day === 2)).toHaveLength(10);
  });

  it('the 2-day cohorts (pilot, discount-aug-26) share the exact Basic curriculum', () => {
    expect(trainings.pilot.modules).toEqual(trainings.basic.modules);
    expect(trainings['discount-aug-26'].modules).toEqual(trainings.basic.modules);
  });

  it('the dated cohorts (pilot, discount-aug-26) carry a fixed online schedule for structured data', () => {
    expect(trainings.pilot.schedule).toEqual({
      startDate: '2026-06-29',
      endDate: '2026-06-30',
      courseMode: ['online'],
    });
    expect(trainings['discount-aug-26'].schedule).toEqual({
      startDate: '2026-09-21',
      endDate: '2026-09-22',
      courseMode: ['online', 'inPerson'],
    });
    expect(trainings.basic.schedule).toBeUndefined();
    expect(trainings.advanced.schedule).toBeUndefined();
  });

  it('discount-aug-26 is the Basic curriculum as a dated cohort with a 30% early-bird until 1 Aug', () => {
    const discountAug26 = trainings['discount-aug-26'];
    expect(discountAug26.durationDays).toBe(2);
    expect(discountAug26.priceEUR).toBe(1399); // full cohort price, not the pilot rate
    expect(discountAug26.modules).toEqual(trainings.basic.modules); // same curriculum as Basic
    expect(discountAug26.earlyBird).toEqual({
      discountPct: 30,
      deadline: '2026-08-01T00:00:00+02:00',
    });
    // the base trainings carry no early-bird
    expect(trainings.basic.earlyBird).toBeUndefined();
    expect(trainings.pilot.earlyBird).toBeUndefined();
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
