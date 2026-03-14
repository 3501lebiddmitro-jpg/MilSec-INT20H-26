import { validateJourneyConfig } from "../../domain/journey/validators.js";
import type { JourneyConfig } from "../../domain/journey/types.js";
import { journeyUkSeed } from "../../seeds/journey.uk.js";

let publishedJourneyConfig: JourneyConfig = journeyUkSeed;

const validation = validateJourneyConfig(publishedJourneyConfig);

if (!validation.valid) {
  throw new Error(
    `Invalid published journey config: ${validation.issues.map((issue) => issue.messageUk).join(" | ")}`
  );
}

export function getPublishedJourneyConfig(): JourneyConfig {
  return publishedJourneyConfig;
}

export function getPublishedJourneySlug(): string {
  return publishedJourneyConfig.journey.slug;
}

export function replacePublishedJourneyConfig(nextConfig: JourneyConfig): JourneyConfig {
  const result = validateJourneyConfig(nextConfig);

  if (!result.valid) {
    throw new Error(result.issues.map((issue) => issue.messageUk).join(" | "));
  }

  publishedJourneyConfig = nextConfig;
  return publishedJourneyConfig;
}
