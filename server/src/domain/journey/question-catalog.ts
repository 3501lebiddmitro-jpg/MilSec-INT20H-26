import type { Condition, PrimitiveValue, QuestionInputType } from "./types.js";

export type QuestionCategory =
  | "goal"
  | "context"
  | "constraints"
  | "wellbeing"
  | "barrier"
  | "profile"
  | "interceptor";

export type QuestionSlot =
  | "entry.goal"
  | "entry.context"
  | "branch.weight-loss"
  | "branch.strength"
  | "branch.flexibility"
  | "branch.endurance"
  | "global.barriers"
  | "global.wellbeing"
  | "global.summary";

export type DashboardRevealTemplate = {
  id: string;
  type: "trait" | "score" | "summary" | "badge";
  key: string;
  titleUk: string;
  sourceField: string;
};

export type QuestionTemplate = {
  id: string;
  code: string;
  key: string;
  category: QuestionCategory;
  slot: QuestionSlot;
  inputType: QuestionInputType;
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  optionSetCode?: string;
  nodeConditions?: Condition[];
  visibilityConditions?: Condition[];
  dashboardRevealTemplates?: DashboardRevealTemplate[];
  tags: string[];
  priority: number;
};

export type QuestionOptionSet = {
  code: string;
  options: Array<{
    labelUk: string;
    value: PrimitiveValue;
    order: number;
    conditions?: Condition[];
  }>;
};

export type GraphInsertionRule = {
  slot: QuestionSlot;
  allowedCategories: QuestionCategory[];
  attachAfterSlots: QuestionSlot[];
  attachBeforeSlots: QuestionSlot[];
  requiredContextFields?: string[];
};

export const questionOptionSets: QuestionOptionSet[] = [
  {
    code: "goal-main",
    options: [
      { labelUk: "Схуднути", value: "weight_loss", order: 1 },
      { labelUk: "Набрати силу", value: "strength", order: 2 },
      { labelUk: "Покращити гнучкість", value: "flexibility", order: 3 },
      { labelUk: "Підвищити витривалість", value: "endurance", order: 4 }
    ]
  },
  {
    code: "context-main",
    options: [
      { labelUk: "Вдома", value: "home", order: 1 },
      { labelUk: "У залі", value: "gym", order: 2 },
      { labelUk: "Надворі", value: "outdoor", order: 3 }
    ]
  },
  {
    code: "time-daily",
    options: [
      { labelUk: "10–15 хвилин", value: "10_15", order: 1 },
      { labelUk: "20–30 хвилин", value: "20_30", order: 2 },
      { labelUk: "45+ хвилин", value: "45_plus", order: 3 }
    ]
  },
  {
    code: "injuries-basic",
    options: [
      { labelUk: "Ні", value: "none", order: 1 },
      { labelUk: "Коліна", value: "knee", order: 2 },
      { labelUk: "Спина", value: "back", order: 3 },
      { labelUk: "Інше", value: "other", order: 4 }
    ]
  },
  {
    code: "stress-basic",
    options: [
      { labelUk: "Низький", value: "low", order: 1 },
      { labelUk: "Середній", value: "medium", order: 2 },
      { labelUk: "Високий", value: "high", order: 3 }
    ]
  },
  {
    code: "barriers-main",
    options: [
      { labelUk: "Нестача часу", value: "lack_of_time", order: 1 },
      { labelUk: "Стрес", value: "stress", order: 2 },
      { labelUk: "Низька мотивація", value: "low_motivation", order: 3 },
      { labelUk: "Дискомфорт або біль", value: "pain", order: 4 }
    ]
  },
  {
    code: "level-basic",
    options: [
      { labelUk: "Початковий", value: "beginner", order: 1 },
      { labelUk: "Середній", value: "intermediate", order: 2 },
      { labelUk: "Просунутий", value: "advanced", order: 3 }
    ]
  }
];

export const questionTemplates: QuestionTemplate[] = [
  {
    id: "qt_goal_main",
    code: "goal-main",
    key: "goal",
    category: "goal",
    slot: "entry.goal",
    inputType: "single-select",
    titleUk: "Яка ваша головна ціль зараз?",
    subtitleUk: "Ми підберемо маршрут саме під неї",
    optionSetCode: "goal-main",
    dashboardRevealTemplates: [
      {
        id: "dr_goal",
        type: "summary",
        key: "goal",
        titleUk: "Ваша ціль",
        sourceField: "goal"
      }
    ],
    tags: ["entry", "primary", "segmentation"],
    priority: 100
  },
  {
    id: "qt_context_main",
    code: "context-main",
    key: "context",
    category: "context",
    slot: "entry.context",
    inputType: "single-select",
    titleUk: "Де вам найзручніше займатися?",
    subtitleUk: "Ми врахуємо ваш реальний формат тренувань",
    optionSetCode: "context-main",
    dashboardRevealTemplates: [
      {
        id: "dr_context",
        type: "summary",
        key: "context",
        titleUk: "Формат тренувань",
        sourceField: "context"
      }
    ],
    tags: ["entry", "context"],
    priority: 95
  },
  {
    id: "qt_time_weight_loss",
    code: "time-weight-loss",
    key: "time_per_day",
    category: "constraints",
    slot: "branch.weight-loss",
    inputType: "single-select",
    titleUk: "Скільки часу на день ви реально можете приділяти?",
    subtitleUk: "Навіть короткі тренування можуть бути ефективними",
    optionSetCode: "time-daily",
    nodeConditions: [
      { field: "goal", operator: "eq", value: "weight_loss" }
    ],
    dashboardRevealTemplates: [
      {
        id: "dr_time",
        type: "trait",
        key: "time_style",
        titleUk: "Ваш ритм",
        sourceField: "time_per_day"
      }
    ],
    tags: ["weight-loss", "constraints"],
    priority: 90
  },
  {
    id: "qt_injuries_strength",
    code: "injuries-strength",
    key: "injuries",
    category: "constraints",
    slot: "branch.strength",
    inputType: "single-select",
    titleUk: "Чи є у вас обмеження або дискомфорт під час навантажень?",
    subtitleUk: "Це допоможе підібрати безпечніший план",
    optionSetCode: "injuries-basic",
    nodeConditions: [
      { field: "goal", operator: "eq", value: "strength" }
    ],
    dashboardRevealTemplates: [
      {
        id: "dr_injuries",
        type: "summary",
        key: "injuries",
        titleUk: "Фізичні обмеження",
        sourceField: "injuries"
      }
    ],
    tags: ["strength", "safety"],
    priority: 90
  },
  {
    id: "qt_level_strength",
    code: "level-strength",
    key: "level",
    category: "profile",
    slot: "branch.strength",
    inputType: "single-select",
    titleUk: "Який у вас зараз рівень підготовки?",
    optionSetCode: "level-basic",
    nodeConditions: [
      { field: "goal", operator: "eq", value: "strength" }
    ],
    dashboardRevealTemplates: [
      {
        id: "dr_level",
        type: "badge",
        key: "level",
        titleUk: "Рівень",
        sourceField: "level"
      }
    ],
    tags: ["strength", "profile"],
    priority: 80
  },
  {
    id: "qt_barrier_main",
    code: "barrier-main",
    key: "barrier",
    category: "barrier",
    slot: "global.barriers",
    inputType: "single-select",
    titleUk: "Що найчастіше заважає вам рухатися до цілі?",
    subtitleUk: "Ми врахуємо це у рекомендації",
    optionSetCode: "barriers-main",
    dashboardRevealTemplates: [
      {
        id: "dr_barrier",
        type: "summary",
        key: "barrier",
        titleUk: "Головний бар'єр",
        sourceField: "barrier"
      }
    ],
    tags: ["global", "barrier"],
    priority: 70
  },
  {
    id: "qt_stress_main",
    code: "stress-main",
    key: "stress",
    category: "wellbeing",
    slot: "global.wellbeing",
    inputType: "single-select",
    titleUk: "Як би ви оцінили свій рівень стресу останнім часом?",
    subtitleUk: "Це впливає на формат і темп програми",
    optionSetCode: "stress-basic",
    dashboardRevealTemplates: [
      {
        id: "dr_stress",
        type: "score",
        key: "stress",
        titleUk: "Рівень стресу",
        sourceField: "stress"
      }
    ],
    tags: ["global", "wellbeing", "interceptor"],
    priority: 75
  }
];

export const graphInsertionRules: GraphInsertionRule[] = [
  {
    slot: "entry.goal",
    allowedCategories: ["goal"],
    attachAfterSlots: [],
    attachBeforeSlots: ["entry.context"]
  },
  {
    slot: "entry.context",
    allowedCategories: ["context"],
    attachAfterSlots: ["entry.goal"],
    attachBeforeSlots: [
      "branch.weight-loss",
      "branch.strength",
      "branch.flexibility",
      "branch.endurance",
      "global.barriers"
    ]
  },
  {
    slot: "branch.weight-loss",
    allowedCategories: ["constraints", "profile", "interceptor"],
    attachAfterSlots: ["entry.context"],
    attachBeforeSlots: ["global.barriers", "global.wellbeing"],
    requiredContextFields: ["goal"]
  },
  {
    slot: "branch.strength",
    allowedCategories: ["constraints", "profile", "interceptor"],
    attachAfterSlots: ["entry.context"],
    attachBeforeSlots: ["global.barriers", "global.wellbeing"],
    requiredContextFields: ["goal"]
  },
  {
    slot: "branch.flexibility",
    allowedCategories: ["constraints", "profile", "interceptor"],
    attachAfterSlots: ["entry.context"],
    attachBeforeSlots: ["global.barriers", "global.wellbeing"],
    requiredContextFields: ["goal"]
  },
  {
    slot: "branch.endurance",
    allowedCategories: ["constraints", "profile", "interceptor"],
    attachAfterSlots: ["entry.context"],
    attachBeforeSlots: ["global.barriers", "global.wellbeing"],
    requiredContextFields: ["goal"]
  },
  {
    slot: "global.barriers",
    allowedCategories: ["barrier", "profile"],
    attachAfterSlots: [
      "entry.context",
      "branch.weight-loss",
      "branch.strength",
      "branch.flexibility",
      "branch.endurance"
    ],
    attachBeforeSlots: ["global.wellbeing", "global.summary"]
  },
  {
    slot: "global.wellbeing",
    allowedCategories: ["wellbeing", "interceptor"],
    attachAfterSlots: ["global.barriers"],
    attachBeforeSlots: ["global.summary"]
  },
  {
    slot: "global.summary",
    allowedCategories: ["profile", "interceptor"],
    attachAfterSlots: ["global.wellbeing"],
    attachBeforeSlots: []
  }
];

export function getQuestionTemplateByCode(code: string): QuestionTemplate | undefined {
  return questionTemplates.find((template) => template.code === code);
}

export function getOptionSetByCode(code: string): QuestionOptionSet | undefined {
  return questionOptionSets.find((optionSet) => optionSet.code === code);
}
