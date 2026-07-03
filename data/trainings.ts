export type ModuleId =
  // 2-day · Day 1 — fundamentals: from concept to first tooling (10 modules)
  | 'agentic-engineering'
  | 'assignment-hobby-page'
  | 'context-architecture'
  | 'assignment-expand-website'
  | 'assignment-tone-of-voice'
  | 'out-of-the-loop'
  | 'intro-skills-rules'
  | 'assignment-create-skill'
  | 'using-mcp-servers'
  | 'plugins-caveman-superpowers'
  // 2-day · Day 2 — quality & advanced (10 modules)
  | 'failure-modes-ai-code'
  | 'test-first-with-agents'
  | 'subagents'
  | 'hooks-and-quality-gates'
  | 'build-first-feature'
  | 'building-a-pipeline'
  | 'persistent-memory'
  | 'openspec'
  | 'regression-and-governance'
  | 'capstone-ship-feature'
  // Advanced 1-day (5 modules)
  | 'team-rollout-playbook'
  | 'agent-harnessing'
  | 'governance-and-policy-gates'
  | 'observability-and-cost'
  | 'capstone-rollout-tabletop'
  // Legacy — retained for i18n + agenda fixtures, not in any current curriculum
  | 'agents-in-sdlc'
  | 'context-window-mechanics';

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

// The approved 2-day curriculum (Miro Day 1 / Day 2 frames). Shared verbatim by
// every 2-day offering — Basic and its dated cohorts (pilot, discount-aug-26) —
// so the three can never drift apart. Day 1 = fundamentals, Day 2 = quality &
// advanced. Pure logistics frames (breaks, lunch, opening, recap, wrap-up) are
// omitted; times and presenters stay in the delivery plan, not the curriculum.
const twoDayCurriculum: Module[] = [
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

export const trainings: Record<TrainingId, Training> = {
  pilot: {
    id: 'pilot',
    durationDays: 2,
    priceEUR: 349,
    schedule: { startDate: '2026-06-29', endDate: '2026-06-30', courseMode: ['online'] },
    modules: twoDayCurriculum,
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
    modules: twoDayCurriculum,
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  basic: {
    id: 'basic',
    durationDays: 2,
    priceEUR: 1399,
    modules: twoDayCurriculum,
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
