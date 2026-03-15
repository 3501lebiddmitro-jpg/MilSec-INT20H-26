import { Router } from "express";
import { z } from "zod";
import {
  continueInfo,
  getSession,
  goBack,
  replaceAnswer,
  startSession,
  submitAnswer
} from "./session.service.js";

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()]))
]);

const submitAnswerSchema = z.object({
  nodeId: z.string().min(1),
  value: answerValueSchema
});

const replaceAnswerSchema = z.object({
  nodeId: z.string().min(1),
  value: answerValueSchema
});

export const sessionRouter = Router();

sessionRouter.post("/", (_req, res) => {
  const result = startSession();
  res.status(201).json(result);
});

sessionRouter.get("/:sessionId", (req, res) => {
  try {
    const session = getSession(req.params.sessionId);
    res.json({ session });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "Сесію не знайдено."
    });
  }
});

sessionRouter.post("/:sessionId/answer", (req, res) => {
  const parsed = submitAnswerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Некоректні дані відповіді.",
      issues: parsed.error.issues
    });
    return;
  }

  try {
    const result = submitAnswer({
      sessionId: req.params.sessionId,
      nodeId: parsed.data.nodeId,
      value: parsed.data.value
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Не вдалося зберегти відповідь."
    });
  }
});

sessionRouter.post("/:sessionId/continue", (req, res) => {
  try {
    const result = continueInfo(req.params.sessionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Не вдалося продовжити квіз."
    });
  }
});

sessionRouter.post("/:sessionId/back", (req, res) => {
  try {
    const result = goBack({
      sessionId: req.params.sessionId
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Не вдалося повернутися назад."
    });
  }
});

sessionRouter.post("/:sessionId/replace-answer", (req, res) => {
  const parsed = replaceAnswerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Некоректні дані для редагування відповіді.",
      issues: parsed.error.issues
    });
    return;
  }

  try {
    const result = replaceAnswer({
      sessionId: req.params.sessionId,
      nodeId: parsed.data.nodeId,
      value: parsed.data.value
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Не вдалося оновити відповідь."
    });
  }
});
