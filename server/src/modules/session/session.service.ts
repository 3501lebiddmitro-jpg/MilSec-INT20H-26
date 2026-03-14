import { getPublishedJourneyConfig } from "../content/content.service.js";
import { createId } from "../../shared/ids.js";
import {
  buildReachablePath,
  deriveAttributes,
  findPreviousNodeId,
  getNodePayload,
  recomputeFlowState,
  resolveNextNodeId
} from "../../domain/journey/rule-engine.js";
import { resolveOffer } from "../../domain/journey/offer-engine.js";
import type { AnswersMap, OfferResult } from "../../domain/journey/types.js";
import type {
  GoBackInput,
  GoBackResult,
  ReplaceAnswerInput,
  ReplaceAnswerResult,
  Session,
  SessionAnswerRecord,
  SessionDashboardState,
  SessionStepSnapshot,
  SessionStorageRecord,
  StartSessionResult,
  SubmitAnswerInput,
  SubmitAnswerResult
} from "../../domain/session/types.js";
import {
  findSessionById,
  getAnswerRevision,
  insertAnswer,
  insertSession,
  updateSession
} from "./session.repository.js";

function nowIso(): string {
  return new Date().toISOString();
}

function parseSessionRecord(record: SessionStorageRecord): Session {
  return {
    id: record.id,
    journeyId: record.journeyId,
    status: record.status,
    answers: JSON.parse(record.answersJson) as AnswersMap,
    derived: JSON.parse(record.derivedJson) as Session["derived"],
    navigation: {
      currentNodeId: record.currentNodeId,
      visitedNodeIds: JSON.parse(record.visitedNodeIdsJson) as string[],
      history: JSON.parse(record.historyJson) as SessionStepSnapshot[]
    },
    dashboard: JSON.parse(record.dashboardJson) as SessionDashboardState,
    result: record.resultJson ? (JSON.parse(record.resultJson) as OfferResult) : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function toStorageRecord(session: Session): SessionStorageRecord {
  return {
    id: session.id,
    journeyId: session.journeyId,
    status: session.status,
    currentNodeId: session.navigation.currentNodeId,
    visitedNodeIdsJson: JSON.stringify(session.navigation.visitedNodeIds),
    historyJson: JSON.stringify(session.navigation.history),
    answersJson: JSON.stringify(session.answers),
    derivedJson: JSON.stringify(session.derived),
    dashboardJson: JSON.stringify(session.dashboard),
    resultJson: session.result ? JSON.stringify(session.result) : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  };
}

function buildDashboardState(answers: AnswersMap): SessionDashboardState {
  const reveals = [];

  if (typeof answers.goal === "string") {
    reveals.push({
      id: "reveal_goal",
      type: "summary",
      key: "goal",
      titleUk: "Ваша ціль",
      value: answers.goal,
      unlockedAt: nowIso()
    });
  }

  if (typeof answers.context === "string") {
    reveals.push({
      id: "reveal_context",
      type: "summary",
      key: "context",
      titleUk: "Формат тренувань",
      value: answers.context,
      unlockedAt: nowIso()
    });
  }

  if (typeof answers.time_per_day === "string") {
    reveals.push({
      id: "reveal_time",
      type: "trait",
      key: "time_per_day",
      titleUk: "Ваш ритм",
      value: answers.time_per_day,
      unlockedAt: nowIso()
    });
  }

  if (typeof answers.stress === "string") {
    reveals.push({
      id: "reveal_stress",
      type: "score",
      key: "stress",
      titleUk: "Рівень стресу",
      value: answers.stress,
      unlockedAt: nowIso()
    });
  }

  if (typeof answers.barrier === "string") {
    reveals.push({
      id: "reveal_barrier",
      type: "badge",
      key: "barrier",
      titleUk: "Головний бар'єр",
      value: answers.barrier,
      unlockedAt: nowIso()
    });
  }

  return { reveals };
}

function buildHistoryFromPath(path: string[], answers: AnswersMap, derived: Session["derived"]): SessionStepSnapshot[] {
  return path.map((nodeId) => ({
    nodeId,
    visitedAt: nowIso(),
    answers,
    derived
  }));
}

function getSessionOrThrow(sessionId: string): Session {
  const record = findSessionById(sessionId);

  if (!record) {
    throw new Error("Сесію не знайдено.");
  }

  return parseSessionRecord(record);
}

export function startSession(): StartSessionResult {
  const config = getPublishedJourneyConfig();
  const createdAt = nowIso();
  const session: Session = {
    id: createId("sess"),
    journeyId: config.journey.id,
    status: "active",
    answers: {},
    derived: {},
    navigation: {
      currentNodeId: config.journey.startNodeId,
      visitedNodeIds: [config.journey.startNodeId],
      history: [
        {
          nodeId: config.journey.startNodeId,
          visitedAt: createdAt,
          answers: {},
          derived: {}
        }
      ]
    },
    dashboard: {
      reveals: []
    },
    createdAt,
    updatedAt: createdAt
  };

  insertSession(toStorageRecord(session));

  return {
    session,
    currentNode: getNodePayload(config.journey.startNodeId, config, session.answers, session.derived)
  };
}

export function getSession(sessionId: string): Session {
  return getSessionOrThrow(sessionId);
}

export function submitAnswer(input: SubmitAnswerInput): SubmitAnswerResult {
  const config = getPublishedJourneyConfig();
  const session = getSessionOrThrow(input.sessionId);
  const currentNode = config.nodes.find((node) => node.id === input.nodeId);

  if (!currentNode || currentNode.type !== "question") {
    throw new Error("Некоректний вузол питання.");
  }

  const nextAnswers: AnswersMap = {
    ...session.answers,
    [currentNode.key]: input.value
  };

  const recomputed = recomputeFlowState(config, nextAnswers);
  const currentPath = buildReachablePath(config, recomputed.answers);
  const currentNodeId = currentPath[currentPath.length - 1] ?? config.journey.startNodeId;
  const nextNodeId = resolveNextNodeId(currentNodeId, config, recomputed.answers, recomputed.derived);

  const revision = getAnswerRevision(session.id, currentNode.key) + 1;

  insertAnswer({
    id: createId("ans"),
    sessionId: session.id,
    nodeId: input.nodeId,
    questionKey: currentNode.key,
    valueJson: JSON.stringify(input.value),
    revision,
    answeredAt: nowIso()
  });

  const visitedNodeIds = nextNodeId ? [...currentPath, nextNodeId] : currentPath;
  const dashboard = buildDashboardState(recomputed.answers);

  session.answers = recomputed.answers;
  session.derived = recomputed.derived;
  session.dashboard = dashboard;
  session.updatedAt = nowIso();

  if (!nextNodeId) {
    session.status = "completed";
    session.result = resolveOffer(config, session.answers, session.derived);
    session.navigation = {
      currentNodeId,
      visitedNodeIds,
      history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
    };

    updateSession(toStorageRecord(session));

    return {
      session,
      mode: "completed",
      result: session.result
    };
  }

  session.navigation = {
    currentNodeId: nextNodeId,
    visitedNodeIds,
    history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
  };
  session.status = "active";
  session.result = undefined;

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "next-node",
    currentNode: getNodePayload(nextNodeId, config, session.answers, session.derived)
  };
}

export function goBack(input: GoBackInput): GoBackResult {
  const config = getPublishedJourneyConfig();
  const session = getSessionOrThrow(input.sessionId);
  const previousNodeId = findPreviousNodeId(session.navigation.currentNodeId, config, session.answers);

  if (!previousNodeId) {
    return {
      session,
      currentNode: getNodePayload(session.navigation.currentNodeId, config, session.answers, session.derived)
    };
  }

  session.navigation.currentNodeId = previousNodeId;
  session.updatedAt = nowIso();

  updateSession(toStorageRecord(session));

  return {
    session,
    currentNode: getNodePayload(previousNodeId, config, session.answers, session.derived)
  };
}

export function replaceAnswer(input: ReplaceAnswerInput): ReplaceAnswerResult {
  const config = getPublishedJourneyConfig();
  const session = getSessionOrThrow(input.sessionId);
  const targetNode = config.nodes.find((node) => node.id === input.nodeId);

  if (!targetNode || targetNode.type !== "question") {
    throw new Error("Некоректний вузол для редагування.");
  }

  const nextAnswers: AnswersMap = {
    ...session.answers,
    [targetNode.key]: input.value
  };

  const recomputed = recomputeFlowState(config, nextAnswers);
  const path = buildReachablePath(config, recomputed.answers);
  const lastNodeId = path[path.length - 1] ?? config.journey.startNodeId;
  const lastNode = config.nodes.find((node) => node.id === lastNodeId);
  const nextNodeId = lastNode ? resolveNextNodeId(lastNode.id, config, recomputed.answers, recomputed.derived) : null;

  const revision = getAnswerRevision(session.id, targetNode.key) + 1;

  insertAnswer({
    id: createId("ans"),
    sessionId: session.id,
    nodeId: targetNode.id,
    questionKey: targetNode.key,
    valueJson: JSON.stringify(input.value),
    revision,
    answeredAt: nowIso()
  });

  session.answers = recomputed.answers;
  session.derived = recomputed.derived;
  session.dashboard = buildDashboardState(recomputed.answers);
  session.updatedAt = nowIso();

  if (!nextNodeId && lastNode?.type === "question") {
    session.status = "completed";
    session.result = resolveOffer(config, session.answers, session.derived);
    session.navigation = {
      currentNodeId: lastNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };

    updateSession(toStorageRecord(session));

    return {
      session,
      mode: "completed",
      result: session.result
    };
  }

  const effectiveCurrentNodeId = nextNodeId ?? lastNodeId;

  session.status = "active";
  session.result = undefined;
  session.navigation = {
    currentNodeId: effectiveCurrentNodeId,
    visitedNodeIds: nextNodeId ? [...path, nextNodeId] : path,
    history: buildHistoryFromPath(nextNodeId ? [...path, nextNodeId] : path, session.answers, session.derived)
  };

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "next-node",
    currentNode: getNodePayload(effectiveCurrentNodeId, config, session.answers, session.derived)
  };
}
