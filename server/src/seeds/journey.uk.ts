import type { JourneyConfig } from "../domain/journey/types.js";

export const journeyUkSeed: JourneyConfig = {
  journey: {
    id: "journey_uk_main",
    slug: "wellness-quiz-uk",
    name: "Персоналізований wellness quiz",
    locale: "uk",
    status: "published",
    version: 1,
    startNodeId: "node_goal"
  },
  nodes: [
    {
      id: "node_goal",
      journeyId: "journey_uk_main",
      type: "question",
      key: "goal",
      inputType: "single-select",
      titleUk: "Яка ваша головна ціль зараз?",
      subtitleUk: "Ми підберемо маршрут саме під неї",
      ui: {
        component: "cards",
        progressLabelUk: "Крок 1",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_context",
      journeyId: "journey_uk_main",
      type: "question",
      key: "context",
      inputType: "single-select",
      titleUk: "Де вам найзручніше займатися?",
      subtitleUk: "Оберіть формат, який реально впишеться у ваше життя",
      ui: {
        component: "cards",
        progressLabelUk: "Крок 2",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_time_weight_loss",
      journeyId: "journey_uk_main",
      type: "question",
      key: "time_per_day",
      inputType: "single-select",
      titleUk: "Скільки часу на день ви реально можете приділяти?",
      subtitleUk: "Навіть короткі тренування можуть бути ефективними",
      ui: {
        component: "chips",
        progressLabelUk: "Крок 3",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_info_short_sessions",
      journeyId: "journey_uk_main",
      type: "info",
      titleUk: "Чудовий старт",
      subtitleUk: "Короткі сесії теж працюють",
      descriptionUk: "Навіть 10–15 хвилин на день можуть дати помітний результат, якщо формат підібрано правильно.",
      ui: {
        nextLabelUk: "Продовжити"
      }
    },
    {
      id: "node_injuries_strength",
      journeyId: "journey_uk_main",
      type: "question",
      key: "injuries",
      inputType: "single-select",
      titleUk: "Чи є у вас обмеження або дискомфорт під час навантажень?",
      subtitleUk: "Це допоможе підібрати безпечніший план",
      ui: {
        component: "cards",
        progressLabelUk: "Крок 3",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_level_strength",
      journeyId: "journey_uk_main",
      type: "question",
      key: "level",
      inputType: "single-select",
      titleUk: "Який у вас зараз рівень підготовки?",
      subtitleUk: "Ми адаптуємо інтенсивність під вас",
      ui: {
        component: "cards",
        progressLabelUk: "Крок 4",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_format_flexibility",
      journeyId: "journey_uk_main",
      type: "question",
      key: "flexibility_focus",
      inputType: "single-select",
      titleUk: "Що для вас зараз важливіше?",
      subtitleUk: "Оберіть те, на чому хочете сфокусуватися",
      ui: {
        component: "cards",
        progressLabelUk: "Крок 3",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_schedule_endurance",
      journeyId: "journey_uk_main",
      type: "question",
      key: "weekly_schedule",
      inputType: "single-select",
      titleUk: "Скільки разів на тиждень ви готові тренуватися?",
      subtitleUk: "Це допоможе підібрати реалістичний темп",
      ui: {
        component: "chips",
        progressLabelUk: "Крок 3",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_barrier",
      journeyId: "journey_uk_main",
      type: "question",
      key: "barrier",
      inputType: "single-select",
      titleUk: "Що найчастіше заважає вам рухатися до цілі?",
      subtitleUk: "Ми врахуємо це у рекомендації",
      ui: {
        component: "cards",
        progressLabelUk: "Наступний крок",
        nextLabelUk: "Далі"
      }
    },
    {
      id: "node_stress",
      journeyId: "journey_uk_main",
      type: "question",
      key: "stress",
      inputType: "single-select",
      titleUk: "Як би ви оцінили свій рівень стресу останнім часом?",
      subtitleUk: "Це впливає на темп та формат програми",
      ui: {
        component: "cards",
        progressLabelUk: "Фінальний крок",
        nextLabelUk: "Завершити"
      }
    }
  ],
  options: [
    {
      id: "opt_goal_weight_loss",
      nodeId: "node_goal",
      labelUk: "Схуднути",
      value: "weight_loss",
      order: 1
    },
    {
      id: "opt_goal_strength",
      nodeId: "node_goal",
      labelUk: "Набрати силу",
      value: "strength",
      order: 2
    },
    {
      id: "opt_goal_flexibility",
      nodeId: "node_goal",
      labelUk: "Покращити гнучкість",
      value: "flexibility",
      order: 3
    },
    {
      id: "opt_goal_endurance",
      nodeId: "node_goal",
      labelUk: "Підвищити витривалість",
      value: "endurance",
      order: 4
    },
    {
      id: "opt_context_home",
      nodeId: "node_context",
      labelUk: "Вдома",
      value: "home",
      order: 1
    },
    {
      id: "opt_context_gym",
      nodeId: "node_context",
      labelUk: "У залі",
      value: "gym",
      order: 2
    },
    {
      id: "opt_context_outdoor",
      nodeId: "node_context",
      labelUk: "Надворі",
      value: "outdoor",
      order: 3
    },
    {
      id: "opt_time_10_15",
      nodeId: "node_time_weight_loss",
      labelUk: "10–15 хвилин",
      value: "10_15",
      order: 1
    },
    {
      id: "opt_time_20_30",
      nodeId: "node_time_weight_loss",
      labelUk: "20–30 хвилин",
      value: "20_30",
      order: 2
    },
    {
      id: "opt_time_45_plus",
      nodeId: "node_time_weight_loss",
      labelUk: "45+ хвилин",
      value: "45_plus",
      order: 3
    },
    {
      id: "opt_injuries_none",
      nodeId: "node_injuries_strength",
      labelUk: "Ні",
      value: "none",
      order: 1
    },
    {
      id: "opt_injuries_knee",
      nodeId: "node_injuries_strength",
      labelUk: "Коліна",
      value: "knee",
      order: 2
    },
    {
      id: "opt_injuries_back",
      nodeId: "node_injuries_strength",
      labelUk: "Спина",
      value: "back",
      order: 3
    },
    {
      id: "opt_injuries_other",
      nodeId: "node_injuries_strength",
      labelUk: "Інше",
      value: "other",
      order: 4
    },
    {
      id: "opt_level_beginner",
      nodeId: "node_level_strength",
      labelUk: "Початковий",
      value: "beginner",
      order: 1
    },
    {
      id: "opt_level_intermediate",
      nodeId: "node_level_strength",
      labelUk: "Середній",
      value: "intermediate",
      order: 2
    },
    {
      id: "opt_level_advanced",
      nodeId: "node_level_strength",
      labelUk: "Просунутий",
      value: "advanced",
      order: 3
    },
    {
      id: "opt_flexibility_posture",
      nodeId: "node_format_flexibility",
      labelUk: "Покращити поставу та мобільність",
      value: "posture_mobility",
      order: 1
    },
    {
      id: "opt_flexibility_recovery",
      nodeId: "node_format_flexibility",
      labelUk: "Зменшити напругу і відновитися",
      value: "recovery_relief",
      order: 2
    },
    {
      id: "opt_flexibility_balance",
      nodeId: "node_format_flexibility",
      labelUk: "Стати більш гнучкою та збалансованою",
      value: "balance_flexibility",
      order: 3
    },
    {
      id: "opt_schedule_2",
      nodeId: "node_schedule_endurance",
      labelUk: "2 рази на тиждень",
      value: "2_per_week",
      order: 1
    },
    {
      id: "opt_schedule_3",
      nodeId: "node_schedule_endurance",
      labelUk: "3 рази на тиждень",
      value: "3_per_week",
      order: 2
    },
    {
      id: "opt_schedule_4_plus",
      nodeId: "node_schedule_endurance",
      labelUk: "4+ рази на тиждень",
      value: "4_plus_per_week",
      order: 3
    },
    {
      id: "opt_barrier_time",
      nodeId: "node_barrier",
      labelUk: "Нестача часу",
      value: "lack_of_time",
      order: 1
    },
    {
      id: "opt_barrier_stress",
      nodeId: "node_barrier",
      labelUk: "Стрес",
      value: "stress",
      order: 2
    },
    {
      id: "opt_barrier_motivation",
      nodeId: "node_barrier",
      labelUk: "Низька мотивація",
      value: "low_motivation",
      order: 3
    },
    {
      id: "opt_barrier_pain",
      nodeId: "node_barrier",
      labelUk: "Дискомфорт або біль",
      value: "pain",
      order: 4
    },
    {
      id: "opt_stress_low",
      nodeId: "node_stress",
      labelUk: "Низький",
      value: "low",
      order: 1
    },
    {
      id: "opt_stress_medium",
      nodeId: "node_stress",
      labelUk: "Середній",
      value: "medium",
      order: 2
    },
    {
      id: "opt_stress_high",
      nodeId: "node_stress",
      labelUk: "Високий",
      value: "high",
      order: 3
    }
  ],
  edges: [
    {
      id: "edge_goal_to_context",
      fromNodeId: "node_goal",
      toNodeId: "node_context",
      priority: 100,
      match: "all",
      conditions: []
    },
    {
      id: "edge_context_to_weight_loss_time",
      fromNodeId: "node_context",
      toNodeId: "node_time_weight_loss",
      priority: 100,
      match: "all",
      conditions: [
        {
          field: "goal",
          operator: "eq",
          value: "weight_loss"
        }
      ]
    },
    {
      id: "edge_context_to_strength_injuries",
      fromNodeId: "node_context",
      toNodeId: "node_injuries_strength",
      priority: 95,
      match: "all",
      conditions: [
        {
          field: "goal",
          operator: "eq",
          value: "strength"
        }
      ]
    },
    {
      id: "edge_context_to_flexibility_focus",
      fromNodeId: "node_context",
      toNodeId: "node_format_flexibility",
      priority: 90,
      match: "all",
      conditions: [
        {
          field: "goal",
          operator: "eq",
          value: "flexibility"
        }
      ]
    },
    {
      id: "edge_context_to_endurance_schedule",
      fromNodeId: "node_context",
      toNodeId: "node_schedule_endurance",
      priority: 85,
      match: "all",
      conditions: [
        {
          field: "goal",
          operator: "eq",
          value: "endurance"
        }
      ]
    },
    {
      id: "edge_context_fallback_to_barrier",
      fromNodeId: "node_context",
      toNodeId: "node_barrier",
      priority: 1,
      match: "all",
      conditions: [],
      isFallback: true
    },
    {
      id: "edge_time_short_to_info",
      fromNodeId: "node_time_weight_loss",
      toNodeId: "node_info_short_sessions",
      priority: 100,
      match: "all",
      conditions: [
        {
          field: "time_per_day",
          operator: "eq",
          value: "10_15"
        }
      ]
    },
    {
      id: "edge_time_default_to_barrier",
      fromNodeId: "node_time_weight_loss",
      toNodeId: "node_barrier",
      priority: 1,
      match: "all",
      conditions: [],
      isFallback: true
    },
    {
      id: "edge_info_short_to_barrier",
      fromNodeId: "node_info_short_sessions",
      toNodeId: "node_barrier",
      priority: 100,
      match: "all",
      conditions: []
    },
    {
      id: "edge_injuries_to_level_if_safe",
      fromNodeId: "node_injuries_strength",
      toNodeId: "node_level_strength",
      priority: 100,
      match: "all",
      conditions: [
        {
          field: "injuries",
          operator: "eq",
          value: "none"
        }
      ]
    },
    {
      id: "edge_injuries_fallback_to_barrier",
      fromNodeId: "node_injuries_strength",
      toNodeId: "node_barrier",
      priority: 1,
      match: "all",
      conditions: [],
      isFallback: true
    },
    {
      id: "edge_level_to_barrier",
      fromNodeId: "node_level_strength",
      toNodeId: "node_barrier",
      priority: 100,
      match: "all",
      conditions: []
    },
    {
      id: "edge_flexibility_to_barrier",
      fromNodeId: "node_format_flexibility",
      toNodeId: "node_barrier",
      priority: 100,
      match: "all",
      conditions: []
    },
    {
      id: "edge_endurance_to_barrier",
      fromNodeId: "node_schedule_endurance",
      toNodeId: "node_barrier",
      priority: 100,
      match: "all",
      conditions: []
    },
    {
      id: "edge_barrier_to_stress",
      fromNodeId: "node_barrier",
      toNodeId: "node_stress",
      priority: 100,
      match: "all",
      conditions: []
    }
  ],
  offers: [
    {
      id: "offer_weight_loss_starter",
      code: "weight-loss-starter",
      category: "primary",
      nameUk: "Старт для схуднення",
      descriptionUk: "Програма для поступового та комфортного зниження ваги.",
      ctaUk: "Почати персональний план"
    },
    {
      id: "offer_lean_strength_builder",
      code: "lean-strength-builder",
      category: "primary",
      nameUk: "Сила та тонус",
      descriptionUk: "Програма для розвитку сили та формування стійкої звички тренувань.",
      ctaUk: "Почати силову програму"
    },
    {
      id: "offer_low_impact_fat_burn",
      code: "low-impact-fat-burn",
      category: "primary",
      nameUk: "М'який low-impact формат",
      descriptionUk: "Низькоударна програма з акцентом на безпечне навантаження.",
      ctaUk: "Переглянути безпечний план"
    },
    {
      id: "offer_run_first_5k",
      code: "run-your-first-5k",
      category: "primary",
      nameUk: "Перші 5 км",
      descriptionUk: "Покрокова програма для розвитку витривалості та бігової звички.",
      ctaUk: "Почати програму витривалості"
    },
    {
      id: "offer_yoga_mobility",
      code: "yoga-and-mobility",
      category: "primary",
      nameUk: "Гнучкість та мобільність",
      descriptionUk: "Програма для покращення рухливості, балансу та відновлення.",
      ctaUk: "Почати програму гнучкості"
    },
    {
      id: "offer_stress_reset",
      code: "stress-reset-program",
      category: "addon",
      nameUk: "Stress Reset",
      descriptionUk: "Додатковий модуль для зниження стресу та м'якої стабілізації ритму.",
      ctaUk: "Додати модуль відновлення"
    },
    {
      id: "offer_quick_fit",
      code: "quick-fit-micro-workouts",
      category: "primary",
      nameUk: "Швидкі мікротренування",
      descriptionUk: "Короткі сесії для зайнятого графіка та стабільного прогресу.",
      ctaUk: "Почати короткий формат"
    }
  ]
};
