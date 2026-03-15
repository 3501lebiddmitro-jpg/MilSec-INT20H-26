import { Router } from "express";
import { getPublishedJourneyConfig, getPublishedJourneySlug } from "./content.service.js";

export const contentRouter = Router();

contentRouter.get("/journey", (_req, res) => {
  const config = getPublishedJourneyConfig();

  res.json({
    journey: config.journey,
    nodes: config.nodes,
    options: config.options,
    edges: config.edges,
    offers: config.offers
  });
});

contentRouter.get("/journey/:slug", (req, res) => {
  const config = getPublishedJourneyConfig();
  const currentSlug = getPublishedJourneySlug();

  if (req.params.slug !== currentSlug) {
    res.status(404).json({
      message: "Опублікований journey не знайдено."
    });
    return;
  }

  res.json({
    journey: config.journey,
    nodes: config.nodes,
    options: config.options,
    edges: config.edges,
    offers: config.offers
  });
});
