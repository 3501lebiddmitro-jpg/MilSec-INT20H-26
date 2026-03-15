import type { JourneyConfig } from "../domain/journey/types.js";

export const journeyUkSeed: JourneyConfig = {
  journey: {
    id: "journey_uk_main",
    slug: "wellness-quiz-uk",
    name: "Фрактальне дерево (Експертна динаміка)",
    locale: "uk",
    status: "published",
    version: 15,
    startNodeId: "node_gender"
  },
  nodes: [
    // === БАЗА ===
    {
      id: "node_gender",
      journeyId: "journey_uk_main",
      type: "question",
      key: "gender",
      inputType: "single-select",
      titleUk: "Вкажіть вашу стать",
      ui: { component: "cards", progressLabelUk: "Крок 1", nextLabelUk: "Далі" }
    },
    {
      id: "node_age",
      journeyId: "journey_uk_main",
      type: "question",
      key: "age",
      inputType: "single-select",
      titleUk: "Ваш вік",
      ui: { component: "chips", progressLabelUk: "Крок 2", nextLabelUk: "Далі" }
    },
    {
      id: "node_goal",
      journeyId: "journey_uk_main",
      type: "question",
      key: "goal",
      inputType: "single-select",
      titleUk: "Яка ваша головна ціль?",
      ui: { component: "cards", progressLabelUk: "Крок 3", nextLabelUk: "Далі" }
    },

    // === ГІЛКА 1: СХУДНЕННЯ ===
    {
      id: "node_wl_blocker",
      journeyId: "journey_uk_main",
      type: "question",
      key: "wl_blocker",
      inputType: "single-select",
      titleUk: "Що найбільше заважало вам схуднути раніше?",
      ui: { component: "cards", progressLabelUk: "Аналіз", nextLabelUk: "Далі" }
    },
    // Реакція на харчування
    {
      id: "node_wl_diet_type",
      journeyId: "journey_uk_main",
      type: "question",
      key: "wl_diet_type",
      inputType: "single-select",
      titleUk: "Як саме проявляються проблеми з харчуванням?",
      ui: { component: "cards", progressLabelUk: "Харчування", nextLabelUk: "Далі" }
    },
    // Реакція на час/мотивацію
    {
      id: "node_wl_lifestyle",
      journeyId: "journey_uk_main",
      type: "question",
      key: "wl_lifestyle",
      inputType: "single-select",
      titleUk: "Який ваш рівень щоденної побутової активності?",
      ui: { component: "chips", progressLabelUk: "Стиль життя", nextLabelUk: "Далі" }
    },
    // Злиття схуднення
    {
      id: "node_wl_metabolism",
      journeyId: "journey_uk_main",
      type: "question",
      key: "wl_metabolism",
      inputType: "single-select",
      titleUk: "Як швидко ви зазвичай набираєте вагу?",
      ui: { component: "cards", progressLabelUk: "Метаболізм", nextLabelUk: "Далі" }
    },

    // === ГІЛКА 2: СИЛА ТА РЕЛЬЄФ ===
    {
      id: "node_str_exp",
      journeyId: "journey_uk_main",
      type: "question",
      key: "str_exp",
      inputType: "single-select",
      titleUk: "Який ваш реальний досвід тренувань?",
      ui: { component: "cards", progressLabelUk: "Досвід", nextLabelUk: "Далі" }
    },
    // Реакція на новачка
    {
      id: "node_str_fear",
      journeyId: "journey_uk_main",
      type: "question",
      key: "str_fear",
      inputType: "single-select",
      titleUk: "Що викликає найбільший дискомфорт на старті?",
      ui: { component: "cards", progressLabelUk: "Психологія", nextLabelUk: "Далі" }
    },
    // Реакція на профі
    {
      id: "node_str_plateau",
      journeyId: "journey_uk_main",
      type: "question",
      key: "str_plateau",
      inputType: "single-select",
      titleUk: "У чому ви зараз відчуваєте застій (плато)?",
      ui: { component: "cards", progressLabelUk: "Прогрес", nextLabelUk: "Далі" }
    },

    // === ГІЛКА 3: ГНУЧКІСТЬ ТА СПИНА ===
    {
      id: "node_flx_pain",
      journeyId: "journey_uk_main",
      type: "question",
      key: "flx_pain",
      inputType: "single-select",
      titleUk: "В якій зоні ви відчуваєте скутість або біль?",
      ui: { component: "cards", progressLabelUk: "Локалізація", nextLabelUk: "Далі" }
    },
    // Реакція на спину/шию
    {
      id: "node_flx_desk",
      journeyId: "journey_uk_main",
      type: "question",
      key: "flx_desk",
      inputType: "single-select",
      titleUk: "Скільки годин на день ви проводите за комп'ютером?",
      ui: { component: "chips", progressLabelUk: "Робота", nextLabelUk: "Далі" }
    },
    // Реакція на ноги/суглоби
    {
      id: "node_flx_joints",
      journeyId: "journey_uk_main",
      type: "question",
      key: "flx_joints",
      inputType: "single-select",
      titleUk: "Чи були у вас раніше травми колін або гомілкостопів?",
      ui: { component: "cards", progressLabelUk: "Здоров'я", nextLabelUk: "Далі" }
    },

    // === ГІЛКА 4: ВИТРИВАЛІСТЬ (БІГ) ===
    {
      id: "node_run_level",
      journeyId: "journey_uk_main",
      type: "question",
      key: "run_level",
      inputType: "single-select",
      titleUk: "Яку дистанцію ви можете пробігти зараз без зупинки?",
      ui: { component: "cards", progressLabelUk: "Старт", nextLabelUk: "Далі" }
    },
    {
      id: "node_run_breath",
      journeyId: "journey_uk_main",
      type: "question",
      key: "run_breath",
      inputType: "single-select",
      titleUk: "Чи буває у вас сильна задишка на сходах?",
      ui: { component: "cards", progressLabelUk: "Серце", nextLabelUk: "Далі" }
    },

    // === ГІЛКА 5: СТРЕС ТА ВІДНОВЛЕННЯ ===
    {
      id: "node_mnt_symptom",
      journeyId: "journey_uk_main",
      type: "question",
      key: "mnt_symptom",
      inputType: "single-select",
      titleUk: "Як саме стрес впливає на ваше тіло?",
      ui: { component: "cards", progressLabelUk: "Симптоми", nextLabelUk: "Далі" }
    },
    {
      id: "node_mnt_sleep",
      journeyId: "journey_uk_main",
      type: "question",
      key: "mnt_sleep",
      inputType: "single-select",
      titleUk: "Що заважає вам якісно висипатися?",
      ui: { component: "cards", progressLabelUk: "Сон", nextLabelUk: "Далі" }
    },

    // === ЗЛИТТЯ ВСІХ ГІЛОК: КОНТЕКСТ ===
    {
      id: "node_context",
      journeyId: "journey_uk_main",
      type: "question",
      key: "context",
      inputType: "single-select",
      titleUk: "Де вам найкомфортніше займатися?",
      ui: { component: "cards", progressLabelUk: "Середовище", nextLabelUk: "Далі" }
    },

    // === РЕАКЦІЯ НА КОНТЕКСТ ===
    {
      id: "node_home_equip",
      journeyId: "journey_uk_main",
      type: "question",
      key: "home_equip",
      inputType: "single-select",
      titleUk: "Чи є у вас якийсь інвентар вдома?",
      ui: { component: "cards", progressLabelUk: "Інвентар", nextLabelUk: "Далі" }
    },
    {
      id: "node_gym_time",
      journeyId: "journey_uk_main",
      type: "question",
      key: "gym_time",
      inputType: "single-select",
      titleUk: "Скільки часу ви можете приділити одному тренуванню?",
      ui: { component: "chips", progressLabelUk: "Графік", nextLabelUk: "Далі" }
    },
    {
      id: "node_outdoor_weather",
      journeyId: "journey_uk_main",
      type: "question",
      key: "outdoor_weather",
      inputType: "single-select",
      titleUk: "Чи готові ви займатися на вулиці в прохолодну погоду?",
      ui: { component: "cards", progressLabelUk: "Умови", nextLabelUk: "Далі" }
    },

    // === ФІНАЛ ===
    {
      id: "node_stress_level",
      journeyId: "journey_uk_main",
      type: "question",
      key: "stress_level",
      inputType: "single-select",
      titleUk: "Останнє питання: ваш загальний рівень стресу останнім часом?",
      subtitleUk: "Стрес напряму блокує результати. Ми врахуємо це в плані.",
      ui: { component: "cards", progressLabelUk: "Фінал", nextLabelUk: "Отримати план" }
    }
  ],
  options: [
    
    // Стать
    { id: "gen_m", nodeId: "node_gender", labelUk: "Чоловік", value: "⚡", order: 1, meta: { reward: "/rewards/men.png" } },
    { id: "gen_f", nodeId: "node_gender", labelUk: "Жінка", value: "female", order: 2, meta: { reward: "rewards/women.png" } },    
    { id: "gen_nb", nodeId: "node_gender", labelUk: "Небінарна особа", value: "non_binary", order: 3 },
    { id: "gen_pr", nodeId: "node_gender", labelUk: "Волію не вказувати", value: "prefer_not_to_say", order: 4 },
    
    // Вік (Більш детальний)
    { id: "age_1", nodeId: "node_age", labelUk: "До 20", value: "under_20", order: 1 },
    { id: "age_2", nodeId: "node_age", labelUk: "21-29", value: "21_29", order: 2 },
    { id: "age_3", nodeId: "node_age", labelUk: "30-39", value: "30_39", order: 3 },
    { id: "age_4", nodeId: "node_age", labelUk: "40-49", value: "40_49", order: 4 },
    { id: "age_5", nodeId: "node_age", labelUk: "50+", value: "50_plus", order: 5 },

    // Ціль
    { id: "goal_wl", nodeId: "node_goal", labelUk: "Схуднення та спалювання жиру", value: "weight_loss", order: 1 },
    { id: "goal_str", nodeId: "node_goal", labelUk: "Набір маси, сила та рельєф", value: "strength", order: 2, meta: { reward: "rewards/body.png" }},
    { id: "goal_flx", nodeId: "node_goal", labelUk: "Здорова спина, гнучкість, без болю", value: "flexibility", order: 3, meta: { reward: "rewards/gimn.png" }},
    { id: "goal_run", nodeId: "node_goal", labelUk: "Витривалість та біг", value: "endurance", order: 4, meta: { reward: "rewards/run.png" } },
    { id: "goal_str_rel", nodeId: "node_goal", labelUk: "Ментальний детокс та антистрес", value: "stress_relief", order: 5 },

    // СХУДНЕННЯ
    { id: "wl_bl_1", nodeId: "node_wl_blocker", labelUk: "Постійні зриви в харчуванні / тяга до солодкого", value: "diet", order: 1 },
    { id: "wl_bl_2", nodeId: "node_wl_blocker", labelUk: "Брак часу та сил після роботи", value: "time", order: 2 },
    { id: "wl_bl_3", nodeId: "node_wl_blocker", labelUk: "Швидко втрачаю мотивацію, кидаю на півшляху", value: "motivation", order: 3 },
    { id: "wl_bl_4", nodeId: "node_wl_blocker", labelUk: "Гормональні зміни / Повільний метаболізм", value: "medical", order: 4 },

    { id: "wl_dt_1", nodeId: "node_wl_diet_type", labelUk: "Їм солодощі щодня, не можу зупинитись", value: "sugar", order: 1 },
    { id: "wl_dt_2", nodeId: "node_wl_diet_type", labelUk: "Заїдаю стрес та емоції великими порціями", value: "stress_eat", order: 2 },
    { id: "wl_dt_3", nodeId: "node_wl_diet_type", labelUk: "Вдень не їм, а ввечері спустошую холодильник", value: "night_eat", order: 3 },

    { id: "wl_ls_1", nodeId: "node_wl_lifestyle", labelUk: "Виключно сидяча робота (менше 3 тис. кроків)", value: "sedentary", order: 1 },
    { id: "wl_ls_2", nodeId: "node_wl_lifestyle", labelUk: "Помірна (намагаюсь гуляти, 5-7 тис. кроків)", value: "moderate", order: 2 },
    { id: "wl_ls_3", nodeId: "node_wl_lifestyle", labelUk: "Весь день на ногах", value: "active", order: 3 },

    { id: "wl_mt_1", nodeId: "node_wl_metabolism", labelUk: "Дуже швидко, варто лише подивитись на торт", value: "fast_gain", order: 1 },
    { id: "wl_mt_2", nodeId: "node_wl_metabolism", labelUk: "Поступово, з віком стало складніше тримати вагу", value: "age_gain", order: 2 },
    { id: "wl_mt_3", nodeId: "node_wl_metabolism", labelUk: "Вага скаче як гойдалка туди-сюди", value: "yo_yo", order: 3 },

    // СИЛА
    { id: "str_ex_1", nodeId: "node_str_exp", labelUk: "Абсолютний новачок (0-3 місяці)", value: "novice", order: 1 },
    { id: "str_ex_2", nodeId: "node_str_exp", labelUk: "Займався(лась) раніше, але була велика пауза", value: "returning", order: 2 },
    { id: "str_ex_3", nodeId: "node_str_exp", labelUk: "Впевнений користувач (понад 1 рік стабільно)", value: "pro", order: 3 },

    { id: "str_fr_1", nodeId: "node_str_fear", labelUk: "Боюсь травмуватися через неправильну техніку", value: "injury", order: 1 },
    { id: "str_fr_2", nodeId: "node_str_fear", labelUk: "Сором'язливість серед 'качків' у залі", value: "social", order: 2 },
    { id: "str_fr_3", nodeId: "node_str_fear", labelUk: "Не знаю з чого почати, потрібен чіткий план", value: "plan", order: 3 },

    { id: "str_pl_1", nodeId: "node_str_plateau", labelUk: "Вага на штанзі не росте вже місяцями", value: "weights", order: 1 },
    { id: "str_pl_2", nodeId: "node_str_plateau", labelUk: "М'язи не збільшуються візуально", value: "hypertrophy", order: 2 },
    { id: "str_pl_3", nodeId: "node_str_plateau", labelUk: "Брак енергії на важкі тренування", value: "energy", order: 3 },

    // ГНУЧКІСТЬ
    { id: "flx_pn_1", nodeId: "node_flx_pain", labelUk: "Поперек (нижня частина спини)", value: "lower_back", order: 1 },
    { id: "flx_pn_2", nodeId: "node_flx_pain", labelUk: "Шия та плечі (синдром комп'ютерної шиї)", value: "neck", order: 2 },
    { id: "flx_pn_3", nodeId: "node_flx_pain", labelUk: "Коліна та тазостегнові суглоби", value: "legs", order: 3 },
    { id: "flx_pn_4", nodeId: "node_flx_pain", labelUk: "Просто хочу сісти на шпагат / стати гнучкішим", value: "general", order: 4 },

    { id: "flx_ds_1", nodeId: "node_flx_desk", labelUk: "Понад 8 годин (офіс/IT)", value: "heavy", order: 1 },
    { id: "flx_ds_2", nodeId: "node_flx_desk", labelUk: "4-7 годин", value: "medium", order: 2 },
    { id: "flx_ds_3", nodeId: "node_flx_desk", labelUk: "Майже не сиджу", value: "low", order: 3 },

    { id: "flx_jt_1", nodeId: "node_flx_joints", labelUk: "Так, були операції або серйозні травми", value: "surgery", order: 1 },
    { id: "flx_jt_2", nodeId: "node_flx_joints", labelUk: "Іноді ниють на погоду або після навантажень", value: "dull_pain", order: 2 },
    { id: "flx_jt_3", nodeId: "node_flx_joints", labelUk: "Ні, суглоби здорові", value: "healthy", order: 3 },

    // БІГ
    { id: "run_lv_1", nodeId: "node_run_level", labelUk: "0 км (задихаюсь на перших хвилинах)", value: "zero", order: 1 },
    { id: "run_lv_2", nodeId: "node_run_level", labelUk: "1-3 км (бігаю іноді)", value: "beginner", order: 2 },
    { id: "run_lv_3", nodeId: "node_run_level", labelUk: "Понад 5 км стабільно", value: "advanced", order: 3 },

    { id: "run_br_1", nodeId: "node_run_breath", labelUk: "Так, серце вистрибує дуже швидко", value: "bad", order: 1 },
    { id: "run_br_2", nodeId: "node_run_breath", labelUk: "Легка задишка, але швидко відновлююсь", value: "ok", order: 2 },

    // СТРЕС
    { id: "mnt_sm_1", nodeId: "node_mnt_symptom", labelUk: "Постійна тривога і нав'язливі думки", value: "anxiety", order: 1 },
    { id: "mnt_sm_2", nodeId: "node_mnt_symptom", labelUk: "Фізичні затиски (стиснуті щелепи, спазм у животі)", value: "physical", order: 2 },
    { id: "mnt_sm_3", nodeId: "node_mnt_symptom", labelUk: "Апатія, немає сил ні на що", value: "apathy", order: 3 },

    { id: "mnt_sl_1", nodeId: "node_mnt_sleep", labelUk: "Довго кручусь, не можу заснути", value: "falling", order: 1 },
    { id: "mnt_sl_2", nodeId: "node_mnt_sleep", labelUk: "Прокидаюсь посеред ночі від тривоги", value: "waking", order: 2 },
    { id: "mnt_sl_3", nodeId: "node_mnt_sleep", labelUk: "Сплю 8 годин, але встаю розбитим", value: "quality", order: 3 },

    // КОНТЕКСТ
    { id: "ctx_hm", nodeId: "node_context", labelUk: "Вдома (максимум приватності)", value: "home", order: 1, meta: { reward: "rewards/home.png" } },
    { id: "ctx_gm", nodeId: "node_context", labelUk: "У тренажерному залі (робоча атмосфера)", value: "gym", order: 2, meta: { reward: "rewards/gym.png" } },
    { id: "ctx_ou", nodeId: "node_context", labelUk: "На вулиці (свіже повітря)", value: "outdoor", order: 3, meta: { reward: "rewards/home.png" } },

    // РЕАКЦІЯ ДОМА
    { id: "heq_1", nodeId: "node_home_equip", labelUk: "Абсолютно нічого, тільки килимок", value: "none", order: 1 },
    { id: "heq_2", nodeId: "node_home_equip", labelUk: "Фітнес-резинки (еспандери)", value: "bands", order: 2 },
    { id: "heq_3", nodeId: "node_home_equip", labelUk: "Гантелі / Гирі", value: "weights", order: 3 },

    // РЕАКЦІЯ ЗАЛ
    { id: "gtm_1", nodeId: "node_gym_time", labelUk: "Експрес: 30-40 хвилин", value: "short", order: 1 },
    { id: "gtm_2", nodeId: "node_gym_time", labelUk: "Повноцінно: 60-90 хвилин", value: "long", order: 2 },

    // РЕАКЦІЯ ВУЛИЦЯ
    { id: "out_1", nodeId: "node_outdoor_weather", labelUk: "Так, мене не зупинить навіть дощ", value: "hardcore", order: 1 },
    { id: "out_2", nodeId: "node_outdoor_weather", labelUk: "Ні, за поганої погоди зроблю заміну вдома", value: "flexible", order: 2 },

    // СТРЕС ФІНАЛ
    { id: "stf_1", nodeId: "node_stress_level", labelUk: "Спокійний(а), все під контролем", value: "low", order: 1 },
    { id: "stf_2", nodeId: "node_stress_level", labelUk: "Періодично штормить, але тримаюсь", value: "medium", order: 2 },
    { id: "stf_3", nodeId: "node_stress_level", labelUk: "Я на межі вигорання", value: "high", order: 3 }
  ],
  edges: [
    // 1. БАЗА
    { id: "e_gen_age", fromNodeId: "node_gender", toNodeId: "node_age", priority: 100, match: "all", conditions: [] },
    { id: "e_age_gol", fromNodeId: "node_age", toNodeId: "node_goal", priority: 100, match: "all", conditions: [] },

    // 2. ГІЛКА СХУДНЕННЯ
    { id: "e_gol_wl", fromNodeId: "node_goal", toNodeId: "node_wl_blocker", priority: 100, match: "all", conditions: [{ field: "goal", operator: "eq", value: "weight_loss" }] },
    
    // РЕАКТИВНІСТЬ 1: Якщо вибрав "Харчування" -> Йдемо у типи харчування
    { id: "e_wl_b_diet", fromNodeId: "node_wl_blocker", toNodeId: "node_wl_diet_type", priority: 100, match: "all", conditions: [{ field: "wl_blocker", operator: "eq", value: "diet" }] },
    // РЕАКТИВНІСТЬ 2: Якщо вибрав "Час/Мотивація/Медичне" -> Йдемо в стиль життя (оминаємо дієту)
    { id: "e_wl_b_life", fromNodeId: "node_wl_blocker", toNodeId: "node_wl_lifestyle", priority: 90, match: "in", conditions: [{ field: "wl_blocker", operator: "in", value: ["time", "motivation", "medical"] }] },
    
    // Обидві підгілки сходяться на метаболізмі
    { id: "e_wl_dt_mtb", fromNodeId: "node_wl_diet_type", toNodeId: "node_wl_metabolism", priority: 100, match: "all", conditions: [] },
    { id: "e_wl_ls_mtb", fromNodeId: "node_wl_lifestyle", toNodeId: "node_wl_metabolism", priority: 100, match: "all", conditions: [] },
    
    // З метаболізму виходимо на Контекст
    { id: "e_wl_mtb_ctx", fromNodeId: "node_wl_metabolism", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },

    // 3. ГІЛКА СИЛИ
    { id: "e_gol_str", fromNodeId: "node_goal", toNodeId: "node_str_exp", priority: 100, match: "all", conditions: [{ field: "goal", operator: "eq", value: "strength" }] },
    
    // РЕАКТИВНІСТЬ: Новачок йде до страхів, Профі йде до плато
    { id: "e_str_x_fr", fromNodeId: "node_str_exp", toNodeId: "node_str_fear", priority: 100, match: "all", conditions: [{ field: "str_exp", operator: "in", value: ["novice", "returning"] }] },
    { id: "e_str_x_pl", fromNodeId: "node_str_exp", toNodeId: "node_str_plateau", priority: 100, match: "all", conditions: [{ field: "str_exp", operator: "eq", value: "pro" }] },

    // Виходимо на Контекст
    { id: "e_str_fr_ctx", fromNodeId: "node_str_fear", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },
    { id: "e_str_pl_ctx", fromNodeId: "node_str_plateau", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },

    // 4. ГІЛКА ГНУЧКОСТІ
    { id: "e_gol_flx", fromNodeId: "node_goal", toNodeId: "node_flx_pain", priority: 100, match: "all", conditions: [{ field: "goal", operator: "eq", value: "flexibility" }] },
    
    // РЕАКТИВНІСТЬ: Спина/Шия -> Робота. Ноги -> Травми суглобів. Загальне -> Робота
    { id: "e_flx_p_dk", fromNodeId: "node_flx_pain", toNodeId: "node_flx_desk", priority: 100, match: "in", conditions: [{ field: "flx_pain", operator: "in", value: ["lower_back", "neck", "general"] }] },
    { id: "e_flx_p_jt", fromNodeId: "node_flx_pain", toNodeId: "node_flx_joints", priority: 100, match: "all", conditions: [{ field: "flx_pain", operator: "eq", value: "legs" }] },

    { id: "e_flx_dk_ctx", fromNodeId: "node_flx_desk", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },
    { id: "e_flx_jt_ctx", fromNodeId: "node_flx_joints", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },

    // 5. ГІЛКА БІГ
    { id: "e_gol_run", fromNodeId: "node_goal", toNodeId: "node_run_level", priority: 100, match: "all", conditions: [{ field: "goal", operator: "eq", value: "endurance" }] },
    { id: "e_run_l_br", fromNodeId: "node_run_level", toNodeId: "node_run_breath", priority: 100, match: "all", conditions: [] },
    { id: "e_run_b_ctx", fromNodeId: "node_run_breath", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },

    // 6. ГІЛКА СТРЕС
    { id: "e_gol_mnt", fromNodeId: "node_goal", toNodeId: "node_mnt_symptom", priority: 100, match: "all", conditions: [{ field: "goal", operator: "eq", value: "stress_relief" }] },
    { id: "e_mnt_s_sl", fromNodeId: "node_mnt_symptom", toNodeId: "node_mnt_sleep", priority: 100, match: "all", conditions: [] },
    { id: "e_mnt_sl_ctx", fromNodeId: "node_mnt_sleep", toNodeId: "node_context", priority: 100, match: "all", conditions: [] },

    // 7. ЗЛИВАННЯ В КОНТЕКСТ І ФІНАЛЬНЕ РОЗГАЛУЖЕННЯ
    // Незалежно від того, яким шляхом ти йшов, ти потрапляєш у node_context.
    // А з нього йдеш у специфічний вузол:
    { id: "e_ctx_home", fromNodeId: "node_context", toNodeId: "node_home_equip", priority: 100, match: "all", conditions: [{ field: "context", operator: "eq", value: "home" }] },
    { id: "e_ctx_gym", fromNodeId: "node_context", toNodeId: "node_gym_time", priority: 100, match: "all", conditions: [{ field: "context", operator: "eq", value: "gym" }] },
    { id: "e_ctx_out", fromNodeId: "node_context", toNodeId: "node_outdoor_weather", priority: 100, match: "all", conditions: [{ field: "context", operator: "eq", value: "outdoor" }] },

    // Всі фінальні вузли контексту сходяться на перевірці стресу
    { id: "e_hm_fin", fromNodeId: "node_home_equip", toNodeId: "node_stress_level", priority: 100, match: "all", conditions: [] },
    { id: "e_gy_fin", fromNodeId: "node_gym_time", toNodeId: "node_stress_level", priority: 100, match: "all", conditions: [] },
    { id: "e_ou_fin", fromNodeId: "node_outdoor_weather", toNodeId: "node_stress_level", priority: 100, match: "all", conditions: [] }
  ],
  offers: [
    {
      id: "offer_1",
      code: "weight-loss-starter",
      category: "primary",
      nameUk: "Weight Loss Starter (Home)",
      descriptionUk: "Digital: план схуднення вдома (20–30 хв).\nPhysical wellness kit: Home Fat-Burn Kit.",
      ctaUk: "Отримати план"
    },
    {
      id: "offer_2",
      code: "lean-strength-builder",
      category: "primary",
      nameUk: "Lean Strength Builder (Gym)",
      descriptionUk: "Digital: програма для залу.\nPhysical wellness kit: Gym Support Kit.",
      ctaUk: "Почати в залі"
    },
    {
      id: "offer_3",
      code: "low-impact-fat-burn",
      category: "primary",
      nameUk: "Low-Impact Fat Burn",
      descriptionUk: "Digital: low-impact план (коліна/спина friendly).\nPhysical wellness kit: Joint-Friendly Kit.",
      ctaUk: "М'який старт"
    },
    {
      id: "offer_4",
      code: "run-your-first-5k",
      category: "primary",
      nameUk: "Run Your First 5K (Outdoor)",
      descriptionUk: "Digital: підготовка до 5K (3 рази/тиж).\nPhysical wellness kit: Runner Starter Kit.",
      ctaUk: "Бігти до цілі"
    },
    {
      id: "offer_5",
      code: "yoga-and-mobility",
      category: "primary",
      nameUk: "Yoga & Mobility (Home)",
      descriptionUk: "Digital: йога/мобільність 10–25 хв.\nPhysical wellness kit: Mobility Kit.",
      ctaUk: "Почати відновлення"
    },
    {
      id: "offer_6",
      code: "stress-reset-program",
      category: "cross-sell",
      nameUk: "Stress Reset Program",
      descriptionUk: "Digital: дихання/медитації/антистрес рутини.\nPhysical wellness kit: Calm-Now Kit.",
      ctaUk: "Знизити стрес"
    },
    {
      id: "offer_7",
      code: "quick-fit-micro-workouts",
      category: "primary",
      nameUk: "Quick Fit Micro-Workouts",
      descriptionUk: "Digital: короткі щоденні тренування.\nPhysical wellness kit: Micro-Workout Kit.",
      ctaUk: "Почати мікро-тренування"
    }
  ]
};