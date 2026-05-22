export type ModuleId =
  // Basic — retained from previous catalogue (8 modules)
  | 'fundamentals-of-agent'
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'build-first-feature'
  | 'intro-skills-rules'
  | 'using-mcp-servers'
  | 'test-first-intro'
  | 'basic-hooks-quality-gates'
  // Basic — new for Day 2 capstone
  | 'capstone-ship-feature'
  // Advanced — retained
  | 'agent-harnessing'
  // Advanced — new
  | 'team-rollout-playbook'
  | 'governance-and-policy-gates'
  | 'observability-and-cost'
  | 'capstone-rollout-tabletop';

export type DeliveryFormat = 'inCompany' | 'publicCohort' | 'remote';

export type Module = { id: ModuleId; day?: 1 | 2 };

export type TrainingId = 'basic' | 'advanced';

export type Training = {
  id: TrainingId;
  durationDays: 1 | 2;
  priceEUR: number;
  modules: Module[];
  deliveryFormats: DeliveryFormat[];
};

export const trainings: Record<TrainingId, Training> = {
  basic: {
    id: 'basic',
    durationDays: 2,
    priceEUR: 1399,
    modules: [
      { id: 'fundamentals-of-agent', day: 1 },
      { id: 'context-architecture', day: 1 },
      { id: 'context-window-mechanics', day: 1 },
      { id: 'build-first-feature', day: 1 },
      { id: 'using-mcp-servers', day: 2 },
      { id: 'intro-skills-rules', day: 2 },
      { id: 'test-first-intro', day: 2 },
      { id: 'basic-hooks-quality-gates', day: 2 },
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
