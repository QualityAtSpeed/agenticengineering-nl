import { describe, it, expect } from 'vitest';
import { trainings, type ModuleId } from '@/data/trainings';

describe('trainings catalogue', () => {
  it('Basic is a 2-day training with the 8 retained modules + capstone, split across 2 days', () => {
    const basic = trainings.basic;
    expect(basic.durationDays).toBe(2);
    expect(basic.priceEUR).toBe(1399);

    const expected: { id: ModuleId; day: 1 | 2 }[] = [
      { id: 'fundamentals-of-agent', day: 1 },
      { id: 'context-architecture', day: 1 },
      { id: 'context-window-mechanics', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
      { id: 'test-first-intro', day: 2 },
      { id: 'basic-hooks-quality-gates', day: 2 },
      { id: 'capstone-ship-feature', day: 2 },
    ];

    expect(basic.modules).toEqual(expected);
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
