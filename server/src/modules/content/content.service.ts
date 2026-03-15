import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, nowIso } from "../../infrastructure/db/client.js";
import { validateJourneyConfig } from "../../domain/journey/validators.js";
import type { JourneyConfig } from "../../domain/journey/types.js";
import { journeyUkSeed } from "../../seeds/journey.uk.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPILED_CONFIG_FILE = path.join(__dirname, "../../../data/journey-config.json");

let publishedJourneyConfig: JourneyConfig = journeyUkSeed;

function validatePublishedConfig(config: JourneyConfig): void {
  const validation = validateJourneyConfig(config);

  if (!validation.valid) {
    throw new Error(
      `Invalid published journey config: ${validation.issues.map((issue) => issue.messageUk).join(" | ")}`
    );
  }
}

function readCompiledJourneyIfExists(): JourneyConfig | null {
  try {
    if (!fs.existsSync(COMPILED_CONFIG_FILE)) {
      return null;
    }

    const raw = fs.readFileSync(COMPILED_CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as JourneyConfig;
    validatePublishedConfig(parsed);
    return parsed;
  } catch {
    return null;
  }
}

function upsertPublishedJourney(config: JourneyConfig): void {
  const timestamp = nowIso();

  const stmt = db.prepare(`
    INSERT INTO journeys (
      id,
      slug,
      name,
      locale,
      status,
      version,
      start_node_id,
      config_json,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @slug,
      @name,
      @locale,
      @status,
      @version,
      @startNodeId,
      @configJson,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name = excluded.name,
      locale = excluded.locale,
      status = excluded.status,
      version = excluded.version,
      start_node_id = excluded.start_node_id,
      config_json = excluded.config_json,
      updated_at = excluded.updated_at
  `);

  stmt.run({
    id: config.journey.id,
    slug: config.journey.slug,
    name: config.journey.name,
    locale: config.journey.locale,
    status: config.journey.status,
    version: config.journey.version,
    startNodeId: config.journey.startNodeId,
    configJson: JSON.stringify(config),
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export function initializePublishedJourney(): JourneyConfig {
  const compiled = readCompiledJourneyIfExists();
  publishedJourneyConfig = compiled ?? journeyUkSeed;

  validatePublishedConfig(publishedJourneyConfig);
  upsertPublishedJourney(publishedJourneyConfig);

  return publishedJourneyConfig;
}

export function getPublishedJourneyConfig(): JourneyConfig {
  const compiled = readCompiledJourneyIfExists();
  if (compiled) {
    publishedJourneyConfig = compiled;
  }

  return publishedJourneyConfig;
}

export function getPublishedJourneySlug(): string {
  return getPublishedJourneyConfig().journey.slug;
}

export function replacePublishedJourneyConfig(nextConfig: JourneyConfig): JourneyConfig {
  validatePublishedConfig(nextConfig);
  publishedJourneyConfig = nextConfig;
  upsertPublishedJourney(publishedJourneyConfig);
  return publishedJourneyConfig;
}