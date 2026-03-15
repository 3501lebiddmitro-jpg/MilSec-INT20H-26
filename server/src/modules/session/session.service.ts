import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createId } from "../../shared/ids.js";
import {
  buildReachablePath,
  findPreviousNodeId,
  getNodePayload,
  recomputeFlowState,
  resolveNextNodeId
} from "../../domain/journey/rule-engine.js";
import { resolveOffer } from "../../domain/journey/offer-engine.js";
import type { AnswersMap, OfferResult, JourneyConfig } from "../../domain/journey/types.js";
import type {
  GoBackInput,
  GoBackResult,
  ReplaceAnswerInput,
  ReplaceAnswerResult,
  Session,
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPILED_CONFIG_FILE = path.join(__dirname, "../../../data/journey-config.json");

export function getActiveJourneyConfig(): JourneyConfig {
  try {
    const data = fs.readFileSync(COMPILED_CONFIG_FILE, "utf-8");
    return JSON.parse(data) as JourneyConfig;
  } catch (error: any) {
    console.error("Config read error:", error.message);
    throw new Error("Конфігурація квіза ще не створена. Будь ласка, зайдіть в Адмінку і натисніть 'Опублікувати'.");
  }
}

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
  const timestamp = nowIso();
  const reveals = [];

  if (typeof answers.goal === "string") {
    reveals.push({ id: "reveal_goal", type: "summary", key: "goal", titleUk: "Ваша ціль", value: answers.goal, unlockedAt: timestamp });
  }
  if (typeof answers.context === "string") {
    reveals.push({ id: "reveal_context", type: "summary", key: "context", titleUk: "Формат", value: answers.context, unlockedAt: timestamp });
  }
  if (typeof answers.time_per_day === "string") {
    reveals.push({ id: "reveal_time", type: "trait", key: "time_per_day", titleUk: "Ваш ритм", value: answers.time_per_day, unlockedAt: timestamp });
  }
  if (typeof answers.level === "string") {
    reveals.push({ id: "reveal_level", type: "badge", key: "level", titleUk: "Рівень", value: answers.level, unlockedAt: timestamp });
  }
  if (typeof answers.barrier === "string") {
    reveals.push({ id: "reveal_barrier", type: "badge", key: "barrier", titleUk: "Головний бар’єр", value: answers.barrier, unlockedAt: timestamp });
  }
  if (typeof answers.stress === "string") {
    reveals.push({ id: "reveal_stress", type: "score", key: "stress", titleUk: "Стрес", value: answers.stress, unlockedAt: timestamp });
  }

  return { reveals };
}

function buildHistoryFromPath(path: string[], answers: AnswersMap, derived: Session["derived"]): SessionStepSnapshot[] {
  const timestamp = nowIso();
  return path.map((nodeId) => ({
    nodeId,
    visitedAt: timestamp,
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

function getFlowPayload(config: JourneyConfig, session: Session) {
  const recomputed = recomputeFlowState(config, session.answers);

  return {
    visitedNodeIds: session.navigation.visitedNodeIds,
    visitedQuestionNodeIds: recomputed.visitedQuestionNodeIds,
    totalNodes: config.nodes.length,
    totalQuestionNodes: recomputed.totalQuestionNodes
  };
}

function getOfferResultFromNode(config: JourneyConfig, nodeId: string): OfferResult | null {
  const node = config.nodes.find((item) => item.id === nodeId);
  const offerId =
    node?.meta &&
    typeof node.meta === "object" &&
    "offerId" in node.meta &&
    typeof node.meta.offerId === "string"
      ? node.meta.offerId
      : null;

  if (!offerId) {
    return null;
  }

  const offer = config.offers.find((item) => item.id === offerId || item.code === offerId);
  if (!offer) {
    return null;
  }

  return {
    offers: [{ ...offer, category: "primary" }],
    matchedRules: [`node:${nodeId}`]
  };
}

function completeSession(session: Session, explicitResult?: OfferResult) {
  const config = getActiveJourneyConfig();

  session.status = "completed";
  session.result = explicitResult ?? resolveOffer(config, session.answers, session.derived);
  session.updatedAt = nowIso();

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "completed" as const,
    result: session.result,
    flow: getFlowPayload(config, session)
  };
}

function moveToNode(session: Session, nextNodeId: string) {
  const config = getActiveJourneyConfig();

  const visitedNodeIds = session.navigation.visitedNodeIds.includes(nextNodeId)
    ? session.navigation.visitedNodeIds
    : [...session.navigation.visitedNodeIds, nextNodeId];

  session.navigation = {
    currentNodeId: nextNodeId,
    visitedNodeIds,
    history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
  };
  session.status = "active";
  session.result = undefined;
  session.updatedAt = nowIso();

  const explicitResult = getOfferResultFromNode(config, nextNodeId);
  if (explicitResult) {
    return completeSession(session, explicitResult);
  }

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "next-node" as const,
    currentNode: getNodePayload(nextNodeId, config, session.answers, session.derived),
    flow: getFlowPayload(config, session)
  };
}

export function startSession(): StartSessionResult {
  const config = getActiveJourneyConfig();
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
    dashboard: { reveals: [] },
    createdAt,
    updatedAt: createdAt
  };

  insertSession(toStorageRecord(session));

  const explicitResult = getOfferResultFromNode(config, config.journey.startNodeId);
  if (explicitResult) {
    session.result = explicitResult;
    session.status = "completed";
    updateSession(toStorageRecord(session));

    return {
      session,
      currentNode: getNodePayload(config.journey.startNodeId, config, session.answers, session.derived),
      flow: getFlowPayload(config, session),
      mode: "completed",
      result: explicitResult
    } as StartSessionResult;
  }

  return {
    session,
    currentNode: getNodePayload(config.journey.startNodeId, config, session.answers, session.derived),
    flow: getFlowPayload(config, session)
  } as StartSessionResult;
}

export function getSession(sessionId: string): Session {
  return getSessionOrThrow(sessionId);
}

export function submitAnswer(input: SubmitAnswerInput): SubmitAnswerResult {
  const config = getActiveJourneyConfig();
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

  session.answers = recomputed.answers;
  session.derived = recomputed.derived;
  session.dashboard = buildDashboardState(recomputed.answers);

  const nextNodeId = resolveNextNodeId(currentNode.id, config, session.answers, session.derived);

  if (!nextNodeId) {
    const path = buildReachablePath(config, session.answers);
    session.navigation = {
      currentNodeId: currentNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };
    return completeSession(session);
  }

  const currentPath = buildReachablePath(config, session.answers);
  const visitedNodeIds = currentPath.includes(nextNodeId) ? currentPath : [...currentPath, nextNodeId];

  session.navigation = {
    currentNodeId: nextNodeId,
    visitedNodeIds,
    history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
  };

  const explicitResult = getOfferResultFromNode(config, nextNodeId);
  if (explicitResult) {
    return completeSession(session, explicitResult);
  }

  session.status = "active";
  session.result = undefined;
  session.updatedAt = nowIso();

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "next-node",
    currentNode: getNodePayload(nextNodeId, config, session.answers, session.derived),
    flow: getFlowPayload(config, session)
  };
}

export function continueInfo(sessionId: string): SubmitAnswerResult {
  const config = getActiveJourneyConfig();
  const session = getSessionOrThrow(sessionId);
  const currentNode = config.nodes.find((node) => node.id === session.navigation.currentNodeId);

  if (!currentNode || currentNode.type !== "info") {
    throw new Error("Поточний вузол не є інформаційним екраном.");
  }

  const explicitCurrentResult = getOfferResultFromNode(config, currentNode.id);
  if (explicitCurrentResult) {
    return completeSession(session, explicitCurrentResult);
  }

  const nextNodeId = resolveNextNodeId(currentNode.id, config, session.answers, session.derived);

  if (!nextNodeId) {
    const path = buildReachablePath(config, session.answers);
    session.navigation = {
      currentNodeId: currentNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };
    return completeSession(session);
  }

  return moveToNode(session, nextNodeId);
}

export function goBack(input: GoBackInput): GoBackResult {
  const config = getActiveJourneyConfig();
  const session = getSessionOrThrow(input.sessionId);
  const previousNodeId = findPreviousNodeId(session.navigation.currentNodeId, config, session.answers);

  if (!previousNodeId) {
    return {
      session,
      currentNode: getNodePayload(session.navigation.currentNodeId, config, session.answers, session.derived),
      flow: getFlowPayload(config, session)
    } as GoBackResult;
  }

  const path = buildReachablePath(config, session.answers);
  const previousIndex = path.findIndex((nodeId) => nodeId === previousNodeId);
  const visitedNodeIds = previousIndex >= 0 ? path.slice(0, previousIndex + 1) : [previousNodeId];

  session.navigation = {
    currentNodeId: previousNodeId,
    visitedNodeIds,
    history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
  };
  session.status = "active";
  session.result = undefined;
  session.updatedAt = nowIso();

  updateSession(toStorageRecord(session));

  return {
    session,
    currentNode: getNodePayload(previousNodeId, config, session.answers, session.derived),
    flow: getFlowPayload(config, session)
  } as GoBackResult;
}

export function replaceAnswer(input: ReplaceAnswerInput): ReplaceAnswerResult {
  const config = getActiveJourneyConfig();
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

  const path = buildReachablePath(config, session.answers);
  const lastNodeId = path[path.length - 1] ?? config.journey.startNodeId;
  const lastNode = config.nodes.find((node) => node.id === lastNodeId);

  if (!lastNode) {
    throw new Error("Не вдалося відновити шлях після редагування.");
  }

  if (lastNode.type === "question" && session.answers[lastNode.key] === undefined) {
    session.navigation = {
      currentNodeId: lastNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };
    session.status = "active";
    session.result = undefined;
    session.updatedAt = nowIso();

    updateSession(toStorageRecord(session));

    return {
      session,
      mode: "next-node",
      currentNode: getNodePayload(lastNode.id, config, session.answers, session.derived),
      flow: getFlowPayload(config, session)
    };
  }

  const explicitLastResult = getOfferResultFromNode(config, lastNode.id);
  if (explicitLastResult) {
    session.navigation = {
      currentNodeId: lastNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };
    return completeSession(session, explicitLastResult);
  }

  const nextNodeId = resolveNextNodeId(lastNode.id, config, session.answers, session.derived);

  if (!nextNodeId) {
    session.navigation = {
      currentNodeId: lastNode.id,
      visitedNodeIds: path,
      history: buildHistoryFromPath(path, session.answers, session.derived)
    };
    return completeSession(session);
  }

  const visitedNodeIds = path.includes(nextNodeId) ? path : [...path, nextNodeId];

  session.navigation = {
    currentNodeId: nextNodeId,
    visitedNodeIds,
    history: buildHistoryFromPath(visitedNodeIds, session.answers, session.derived)
  };

  const explicitResult = getOfferResultFromNode(config, nextNodeId);
  if (explicitResult) {
    return completeSession(session, explicitResult);
  }

  session.status = "active";
  session.result = undefined;
  session.updatedAt = nowIso();

  updateSession(toStorageRecord(session));

  return {
    session,
    mode: "next-node",
    currentNode: getNodePayload(nextNodeId, config, session.answers, session.derived),
    flow: getFlowPayload(config, session)
  };
}