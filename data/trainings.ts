export type ModuleId =
  // Basic Day 1 — quality engineering with agents (6 modules)
  | 'agents-in-sdlc'
  | 'failure-modes-ai-code'
  | 'test-first-with-agents'
  | 'hooks-and-quality-gates'
  | 'build-first-feature'
  | 'regression-and-governance'
  // Basic Day 2 — agent mechanics + capstone (5 modules)
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'using-mcp-servers'
  | 'intro-skills-rules'
  | 'capstone-ship-feature'
  // Advanced (5 modules)
  | 'team-rollout-playbook'
  | 'agent-harnessing'
  | 'governance-and-policy-gates'
  | 'observability-and-cost'
  | 'capstone-rollout-tabletop';

export type DeliveryFormat = 'inCompany' | 'publicCohort' | 'remote';

export type Module = { id: ModuleId; day?: 1 | 2 };

export type TrainingId = 'basic' | 'advanced' | 'pilot' | 'discount-aug-26';

// Optional fixed schedule, in ISO 8601, for trainings that run on a known date.
// Used only for machine-readable structured data (schema.org CourseInstance) —
// the human-facing date still lives in the localized `name` string. Trainings
// without a fixed date (basic/advanced) omit this.
export type TrainingSchedule = {
  startDate: string;
  endDate: string;
  courseMode: string[];
};

// Optional early-bird: a discount that applies while `now < deadline` (ISO 8601,
// deadline exclusive). Enforced server-side in the checkout, not just shown.
export type EarlyBird = {
  discountPct: number;
  deadline: string;
};

export type Training = {
  id: TrainingId;
  durationDays: 1 | 2;
  priceEUR: number;
  modules: Module[];
  deliveryFormats: DeliveryFormat[];
  schedule?: TrainingSchedule;
  earlyBird?: EarlyBird;
  // When true, the card renders a sold-out state: dimmed content, a red
  // "sold out" badge/label, and a disabled booking button.
  soldOut?: boolean;
};

export const trainings: Record<TrainingId, Training> = {
  pilot: {
    id: 'pilot',
    durationDays: 2,
    priceEUR: 349,
    schedule: { startDate: '2026-06-29', endDate: '2026-06-30', courseMode: ['online'] },
    modules: [
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
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
    soldOut: true,
  },

  'discount-aug-26': {
    id: 'discount-aug-26',
    durationDays: 2,
    priceEUR: 1399,
    schedule: {
      startDate: '2026-09-21',
      endDate: '2026-09-22',
      courseMode: ['online', 'inPerson'],
    },
    earlyBird: { discountPct: 30, deadline: '2026-08-01T00:00:00+02:00' },
    modules: [
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
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  basic: {
    id: 'basic',
    durationDays: 2,
    priceEUR: 1399,
    modules: [
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
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  advanced: {
    id: 'advanced',
    durationDays: 1,
    priceEUR: 999,
    modules: [
      { id: 'team-rollout-playbook' },
      { id: 'agent-harnessing' },
      { id: 'governance-and-policy-gates' },
      { id: 'observability-and-cost' },
      { id: 'capstone-rollout-tabletop' },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
};
