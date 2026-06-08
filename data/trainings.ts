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
  | 'capstone-rollout-tabletop'
  // Introduction (2 new modules; 'agents-in-sdlc' reused from Basic Day 1)
  | 'prompt-engineering-basics'
  | 'plugins-and-skills';
export type DeliveryFormat = 'inCompany' | 'publicCohort' | 'remote';

export type Module = { id: ModuleId; day?: 1 | 2 };

export type TrainingId = 'basic' | 'advanced' | 'introduction';

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
  introduction: {
    id: 'introduction',
    durationDays: 1,
    priceEUR: 299,
    modules: [
      { id: 'agents-in-sdlc' },
      { id: 'prompt-engineering-basics' },
      { id: 'plugins-and-skills' },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
};
