export type ModuleId =
  | 'fundamentals-of-agent'
  | 'context-architecture'
  | 'context-window-mechanics'
  | 'build-first-feature'
  | 'intro-skills-rules'
  | 'using-mcp-servers'
  | 'test-first-intro'
  | 'basic-hooks-quality-gates'
  | 'building-custom-mcp'
  | 'skills-rules-deep'
  | 'agents-sdlc-phases'
  | 'agent-harnessing'
  | 'advanced-hooks-quality-gates'
  | 'test-first-advanced'
  | 'team-workflows-governance';

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
    durationDays: 1,
    priceEUR: 799,
    modules: [
      { id: 'fundamentals-of-agent' },
      { id: 'context-architecture' },
      { id: 'context-window-mechanics' },
      { id: 'build-first-feature' },
      { id: 'intro-skills-rules' },
      { id: 'using-mcp-servers' },
      { id: 'test-first-intro' },
      { id: 'basic-hooks-quality-gates' },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
  advanced: {
    id: 'advanced',
    durationDays: 2,
    priceEUR: 1799,
    modules: [
      { id: 'building-custom-mcp', day: 1 },
      { id: 'skills-rules-deep', day: 1 },
      { id: 'agents-sdlc-phases', day: 1 },
      { id: 'agent-harnessing', day: 2 },
      { id: 'advanced-hooks-quality-gates', day: 2 },
      { id: 'test-first-advanced', day: 2 },
      { id: 'team-workflows-governance', day: 2 },
    ],
    deliveryFormats: ['inCompany', 'publicCohort', 'remote'],
  },
};
