import type { AnswersMap, JourneyConfig, OfferResult, Offer } from "./types.js";

function firstOffer(config: JourneyConfig): Offer | undefined {
  return config.offers[0];
}

function makeDynamicOffer(params: {
  id: string;
  code: string;
  nameUk: string;
  descriptionUk: string;
  ctaUk?: string;
  category?: "primary" | "addon" | "cross-sell";
}): Offer {
  return {
    id: params.id,
    code: params.code,
    nameUk: params.nameUk,
    descriptionUk: params.descriptionUk,
    ctaUk: params.ctaUk || "Почати програму",
    category: params.category || "primary"
  };
}

export function resolveOffer(
  config: JourneyConfig,
  answers: AnswersMap,
  derived: Record<string, unknown>
): OfferResult {
  const goal = String(answers.goal ?? "");
  const gender = String(answers.gender ?? "");
  const age = String(answers.age ?? "");

  const wlBlocker = String(answers.wl_blocker ?? "");
  const wlDietType = String(answers.wl_diet_type ?? "");
  const wlLifestyle = String(answers.wl_lifestyle ?? "");
  const wlMetabolism = String(answers.wl_metabolism ?? "");

  const strExp = String(answers.str_exp ?? "");
  const strFear = String(answers.str_fear ?? "");
  const strPlateau = String(answers.str_plateau ?? "");

  const flxPain = String(answers.flx_pain ?? "");
  const flxDesk = String(answers.flx_desk ?? "");
  const flxJoints = String(answers.flx_joints ?? "");

  const runLevel = String(answers.run_level ?? "");
  const runBreath = String(answers.run_breath ?? "");

  const matchedRules: string[] = [];
  const offers: Offer[] = [];

  if (goal === "weight_loss") {
    matchedRules.push("goal:weight_loss");

    let programName = "Програма для схуднення";
    let programDescription =
      "Персональний план зі зниження ваги з поступовим навантаженням, простими звичками та структурованим режимом.";

    if (wlBlocker === "diet" || wlDietType) {
      programName = "Програма контролю харчування та схуднення";
      programDescription =
        "Фокус на стабілізації харчових звичок, зменшенні переїдання, простому режимі прийомів їжі та м'якому зниженні ваги.";
      matchedRules.push("wl:food");
    } else if (wlBlocker === "time") {
      programName = "Швидка програма схуднення для зайнятого графіка";
      programDescription =
        "Короткі щоденні тренування, мінімальний поріг входу та план, який легко виконувати навіть при нестачі часу.";
      matchedRules.push("wl:time");
    } else if (wlBlocker === "activity" || wlLifestyle) {
      programName = "Програма підвищення активності та схуднення";
      programDescription =
        "План для поступового збільшення рухливості протягом дня, домашніх тренувань і стабільного зниження ваги без перевантаження.";
      matchedRules.push("wl:activity");
    }

    if (wlMetabolism === "fast_gain") {
      programDescription +=
        " Додатково враховано схильність до швидкого набору ваги: акцент на контроль калорійності, режим та відновлення.";
      matchedRules.push("wl:metabolism");
    }

    offers.push(
      makeDynamicOffer({
        id: "dynamic_weight_loss_program",
        code: "dynamic_weight_loss_program",
        nameUk: programName,
        descriptionUk: programDescription
      })
    );
  }

  else if (goal === "strength") {
    matchedRules.push("goal:strength");

    let programName = "Програма набору сили";
    let programDescription =
      "Покроковий силовий план із безпечним прогресом, контролем техніки та поступовим збільшенням навантаження.";

    if (strExp === "beginner") {
      programName = "Стартова програма сили для початківця";
      programDescription =
        "Базовий силовий маршрут для новачка: прості вправи, адаптація до навантаження, техніка та плавний вхід у тренування.";
      matchedRules.push("str:beginner");
    } else if (strExp === "intermediate") {
      programName = "Програма прогресії сили";
      programDescription =
        "План для тих, хто вже тренувався: системна прогресія, контроль навантаження та вихід із застою.";
      matchedRules.push("str:intermediate");
    } else if (strExp === "advanced") {
      programName = "Просунута силова програма";
      programDescription =
        "Структурований силовий блок для досвідченого рівня з акцентом на прогресію, відновлення та періодизацію.";
      matchedRules.push("str:advanced");
    }

    if (strFear) {
      programDescription +=
        " У програмі враховано стартові бар'єри та психологічний дискомфорт, щоб знизити відчуття перевантаження на початку.";
      matchedRules.push("str:fear");
    }

    if (strPlateau) {
      programDescription +=
        " Додатково закладені рішення для подолання плато та стабілізації прогресу.";
      matchedRules.push("str:plateau");
    }

    offers.push(
      makeDynamicOffer({
        id: "dynamic_strength_program",
        code: "dynamic_strength_program",
        nameUk: programName,
        descriptionUk: programDescription
      })
    );
  }

  else if (goal === "flexibility") {
    matchedRules.push("goal:flexibility");

    let programName = "Програма мобільності та гнучкості";
    let programDescription =
      "Щоденний план на покращення рухливості, зменшення скутості та м'яке відновлення тіла.";

    if (flxPain === "neck" || flxPain === "upper_back") {
      programName = "Програма для шиї та верхньої спини";
      programDescription =
        "Комплекс на зменшення напруги в шиї, плечах і верхній частині спини, особливо для сидячого способу життя.";
      matchedRules.push("flx:upper");
    } else if (flxPain === "lower_back") {
      programName = "Програма мобільності для попереку";
      programDescription =
        "М'яка програма для зняття скутості в попереку, покращення рухливості таза та комфортного повсякденного руху.";
      matchedRules.push("flx:lower_back");
    } else if (flxPain === "legs") {
      programName = "Програма гнучкості для ніг і тазу";
      programDescription =
        "Фокус на стегна, задню поверхню ніг і гомілкостоп, щоб покращити амплітуду руху та зменшити скутість.";
      matchedRules.push("flx:legs");
    }

    if (flxDesk === "long_hours") {
      programDescription +=
        " Програма враховує тривалу сидячу роботу та включає вправи для компенсації навантаження від сидіння.";
      matchedRules.push("flx:desk");
    }

    if (flxJoints === "injury" || flxJoints === "yes") {
      programDescription +=
        " Додані щадні варіанти вправ з урахуванням попередніх проблем із суглобами.";
      matchedRules.push("flx:joints");
    }

    offers.push(
      makeDynamicOffer({
        id: "dynamic_flexibility_program",
        code: "dynamic_flexibility_program",
        nameUk: programName,
        descriptionUk: programDescription
      })
    );
  }

  else if (goal === "endurance") {
    matchedRules.push("goal:endurance");

    let programName = "Програма розвитку витривалості";
    let programDescription =
      "Поступовий кардіо-план для покращення витривалості, дихання та здатності витримувати навантаження.";

    if (runLevel === "zero" || runLevel === "short") {
      programName = "Програма витривалості з нуля";
      programDescription =
        "Покроковий стартовий план для тих, хто тільки починає: чергування ходьби й легкого бігу, контроль навантаження і ритму.";
      matchedRules.push("run:beginner");
    } else if (runLevel === "medium") {
      programName = "Програма підготовки до стабільного бігу";
      programDescription =
        "План для розвитку стійкої витривалості, покращення темпу і поступового збільшення дистанції.";
      matchedRules.push("run:medium");
    } else if (runLevel === "long") {
      programName = "Програма підвищення бігової витривалості";
      programDescription =
        "Маршрут для тих, хто вже має базу й хоче розвинути дихання, темп і здатність проходити довші дистанції.";
      matchedRules.push("run:advanced");
    }

    if (runBreath === "yes" || runBreath === "often") {
      programDescription +=
        " Окремий акцент зроблено на дихальні патерни, контроль темпу та поступову адаптацію серцево-судинної системи.";
      matchedRules.push("run:breath");
    }

    offers.push(
      makeDynamicOffer({
        id: "dynamic_endurance_program",
        code: "dynamic_endurance_program",
        nameUk: programName,
        descriptionUk: programDescription
      })
    );
  }

  if (offers.length === 0) {
    const fallback = firstOffer(config);

    if (fallback) {
      offers.push({ ...fallback, category: "primary" });
      matchedRules.push("fallback:first_offer");
    } else {
      offers.push(
        makeDynamicOffer({
          id: "dynamic_generic_program",
          code: "dynamic_generic_program",
          nameUk: "Базова персональна wellness-програма",
          descriptionUk:
            "Ми сформували універсальний стартовий план на основі ваших відповідей: поступове навантаження, комфортний темп і простий вхід у програму."
        })
      );
      matchedRules.push("fallback:dynamic_generic");
    }
  }

  if (age) {
    matchedRules.push(`age:${age}`);
  }

  if (gender) {
    matchedRules.push(`gender:${gender}`);
  }

  return {
    offers,
    matchedRules
  };
}