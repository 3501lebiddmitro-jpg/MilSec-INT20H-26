import type {
  AnswerValue,
  AnswersMap,
  DerivedMap,
  NodePayload,
  OfferResult,
  PrimitiveValue
} from "../journey/types.js";

export type SessionStatus = "active" | "completed" | "abandoned";

export type SessionAnswerRecord = {
  nodeId: string;
  questionKey: string;
  value: AnswerValue;
  answeredAt: string;
  revision: number;
};

export type SessionStepSnapshot = {
  nodeId: string;
  visitedAt: string;
  answers: AnswersMap;
  derived: DerivedMap;
};

export type DashboardMetricType = "trait" | "score" | "summary" | "badge";

export type DashboardReveal = {
  id: string;
  type: DashboardMetricType;
  key: string;
  titleUk: string;
  value: PrimitiveValue | PrimitiveValue[];
  unlockedAt: string;
};

export type SessionDashboardState = {
  reveals: DashboardReveal[];
};

export type SessionNavigationState = {
  currentNodeId: string;
  visitedNodeIds: string[];
  history: SessionStepSnapshot[];
};

export type Session = {
  id: string;
  journeyId: string;
  status: SessionStatus;
  answers: AnswersMap;
  derived: DerivedMap;
  navigation: SessionNavigationState;
  dashboard: SessionDashboardState;
  result?: OfferResult;
  createdAt: string;
  updatedAt: string;
};

export type StartSessionResult = {
  session: Session;
  currentNode: NodePayload;
};

export type SubmitAnswerInput = {
  sessionId: string;
  nodeId: string;
  value: AnswerValue;
};

export type SubmitAnswerNextNodeResult = {
  session: Session;
  mode: "next-node";
  currentNode: NodePayload;
};

export type SubmitAnswerCompletedResult = {
  session: Session;
  mode: "completed";
  result: OfferResult;
};

export type SubmitAnswerResult = SubmitAnswerNextNodeResult | SubmitAnswerCompletedResult;

export type GoBackInput = {
  sessionId: string;
};

export type GoBackResult = {
  session: Session;
  currentNode: NodePayload;
};

export type ReplaceAnswerInput = {
  sessionId: string;
  nodeId: string;
  value: AnswerValue;
};

export type ReplaceAnswerResult = {
  session: Session;
  mode: "next-node" | "completed";
  currentNode?: NodePayload;
  result?: OfferResult;
};

export type SessionStorageRecord = {
  id: string;
  journeyId: string;
  status: SessionStatus;
  currentNodeId: string;
  visitedNodeIdsJson: string;
  historyJson: string;
  answersJson: string;
  derivedJson: string;
  dashboardJson: string;
  resultJson: string | null;
  createdAt: string;
  updatedAt: string;
};
