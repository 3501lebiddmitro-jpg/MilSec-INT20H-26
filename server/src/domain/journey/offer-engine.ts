import type { AnswersMap, DerivedMap, JourneyConfig, Offer, OfferResult } from "./types.js";

function getOfferByCode(config: JourneyConfig, code: string): Offer {
  const offer = config.offers.find((item) => item.code === code);

  if (!offer) {
    throw new Error(`Offer not found: ${code}`);
  }

  return offer;
}

function buildExplanationUk(answers: AnswersMap, derived: DerivedMap, primaryOffer: Offer, secondaryOffers: Offer[]): string {
  const parts: string[] = [];

  if (typeof answers.goal === "string") {
    if (answers.goal === "weight_loss") {
      parts.push("ви хочете схуднути");
    } else if (answers.goal === "strength") {
      parts.push("ви хочете набрати силу");
    } else if (answers.goal === "flexibility") {
      parts.push("ви хочете покращити гнучкість");
    } else if (answers.goal === "endurance") {
      parts.push("ви хочете підвищити витривалість");
    }
  }

  if (typeof answers.context === "string") {
    if (answers.context === "home") {
      parts.push("вам зручно займатися вдома");
    } else if (answers.context === "gym") {
      parts.push("вам підходить формат занять у залі");
    } else if (answers.context === "outdoor") {
      parts.push("вам комфортно тренуватися надворі");
    }
  }

  if (typeof derived.time_bucket === "string") {
    if (derived.time_bucket === "short") {
      parts.push("у вас обмежений час на щоденні тренування");
    } else if (derived.time_bucket === "medium") {
      parts.push("у вас є стабільні 20–30 хвилин на день");
    } else if (derived.time_bucket === "long") {
      parts.push("ви можете виділяти більше часу на тренування");
    }
  }

  if (derived.needs_low_impact === true) {
    parts.push("важливо врахувати м'якший формат навантаження");
  }

  if (derived.stress_high === true) {
    parts.push("ваш поточний рівень стресу теж впливає на формат програми");
  }

  const base = parts.length > 0
    ? `Ми підібрали програму «${primaryOffer.nameUk}», тому що ${parts.join(", ")}.`
    : `Ми підібрали програму «${primaryOffer.nameUk}» на основі ваших відповідей.`;

  if (secondaryOffers.length === 0) {
    return base;
  }

  const secondaryNames = secondaryOffers.map((offer) => `«${offer.nameUk}»`).join(", ");
  return `${base} Додатково ми включили ${secondaryNames}, щоб рекомендація була більш персоналізованою.`;
}

function resolvePrimaryOfferCode(answers: AnswersMap, derived: DerivedMap): string {
  if (answers.goal === "weight_loss" && answers.context === "home") {
    if (derived.time_bucket === "short") {
      return "quick-fit-micro-workouts";
    }

    if (derived.time_bucket === "medium" || derived.time_bucket === "long") {
      return "weight-loss-starter";
    }
  }

  if (answers.goal === "strength" && answers.context === "gym") {
    if (derived.needs_low_impact === true) {
      return "low-impact-fat-burn";
    }

    return "lean-strength-builder";
  }

  if (answers.goal === "flexibility") {
    return "yoga-and-mobility";
  }

  if (answers.goal === "endurance" && answers.context === "outdoor") {
    return "run-your-first-5k";
  }

  if (answers.goal === "weight_loss" && answers.context === "gym") {
    if (derived.needs_low_impact === true) {
      return "low-impact-fat-burn";
    }

    return "weight-loss-starter";
  }

  if (answers.goal === "strength" && answers.context === "home") {
    if (derived.time_bucket === "short") {
      return "quick-fit-micro-workouts";
    }

    return "lean-strength-builder";
  }

  if (answers.goal === "endurance") {
    return "run-your-first-5k";
  }

  return "yoga-and-mobility";
}

function resolveSecondaryOfferCodes(answers: AnswersMap, derived: DerivedMap): string[] {
  const codes: string[] = [];

  if (derived.stress_high === true || derived.barrier_is_stress === true) {
    codes.push("stress-reset-program");
  }

  if (answers.barrier === "low_motivation" && derived.time_bucket === "short") {
    if (!codes.includes("stress-reset-program")) {
      codes.push("stress-reset-program");
    }
  }

  return codes;
}

export function resolveOffer(config: JourneyConfig, answers: AnswersMap, derived: DerivedMap): OfferResult {
  const primaryOfferCode = resolvePrimaryOfferCode(answers, derived);
  const secondaryOfferCodes = resolveSecondaryOfferCodes(answers, derived);

  const primaryOffer = getOfferByCode(config, primaryOfferCode);
  const secondaryOffers = secondaryOfferCodes.map((code) => getOfferByCode(config, code));

  const explanationUk = buildExplanationUk(answers, derived, primaryOffer, secondaryOffers);

  return {
    primaryOfferId: primaryOffer.id,
    secondaryOfferIds: secondaryOffers.map((offer) => offer.id),
    explanationUk,
    ctaUk: primaryOffer.ctaUk
  };
}
