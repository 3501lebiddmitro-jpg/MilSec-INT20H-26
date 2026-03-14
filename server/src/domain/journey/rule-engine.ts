import type {
  AnswerValue,
  AnswersMap,
  Condition,
  ConditionValue,
  DerivedMap,
  Edge,
  InfoNode,
  JourneyConfig,
  Node,
  NodePayload,
  Option,
  PrimitiveValue,
  QuestionNode,
  QuestionNodePayload,
  RenderableOption
} from "./types.js";

function isPrimitiveArray(value: unknown): value is PrimitiveValue[] {
  return Array.isArray(value);
}

function toComparableArray(value: unknown): PrimitiveValue[] {
  if (Array.isArray(value)) {
    return value as PrimitiveValue[];
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [value as PrimitiveValue];
}

function getContextValue(
  field: string,
  answers: AnswersMap,
  derived: DerivedMap
): AnswerValue | PrimitiveValue | PrimitiveValue[] | undefined {
  if (field in derived) {
    return derived[field];
  }

  return answers[field];
}

function eqOperator(actual: unknown, expected: ConditionValue): boolean {
  if (Array.isArray(actual)) {
    return actual.includes(expected as PrimitiveValue);
  }

  return actual === expected;
}

function neqOperator(actual: unknown, expected: ConditionValue): boolean {
  return !eqOperator(actual, expected);
}

function inOperator(actual: unknown, expected: ConditionValue): boolean {
  if (!Array.isArray(expected)) {
    return false;
  }

  if (Array.isArray(actual)) {
    return actual.some((item) => expected.includes(item));
  }

  return expected.includes(actual as PrimitiveValue);
}

function notInOperator(actual: unknown, expected: ConditionValue): boolean {
  return !inOperator(actual, expected);
}

function numericCompare(
  actual: unknown,
  expected: ConditionValue,
  comparator: (left: number, right: number) => boolean
): boolean {
  const left = Number(actual);
  const right = Number(expected);

  if (Number.isNaN(left) || Number.isNaN(right)) {
    return false;
  }

  return comparator(left, right);
}

function containsOperator(actual: unknown, expected: ConditionValue): boolean {
  const actualValues = toComparableArray(actual);

  if (Array.isArray(expected)) {
    return expected.some((value) => actualValues.includes(value));
  }

  return actualValues.includes(expected);
}

export function matchCondition(
  condition: Condition,
  answers: AnswersMap,
  derived: DerivedMap
): boolean {
  const actual = getContextValue(condition.field, answers, derived);

  switch (condition.operator) {
    case "eq":
      return eqOperator(actual, condition.value);
    case "neq":
      return neqOperator(actual, condition.value);
    case "in":
      return inOperator(actual, condition.value);
    case "not_in":
      return notInOperator(actual, condition.value);
    case "gt":
      return numericCompare(actual, condition.value, (left, right) => left > right);
    case "gte":
      return numericCompare(actual, condition.value, (left, right) => left >= right);
    case "lt":
      return numericCompare(actual, condition.value, (left, right) => left < right);
    case "lte":
      return numericCompare(actual, condition.value, (left, right) => left <= right);
    case "contains":
      return containsOperator(actual, condition.value);
    default:
      return false;
  }
}

export function matchConditions(
  conditions: Condition[],
  match: "all" | "any",
  answers: AnswersMap,
  derived: DerivedMap
): boolean {
  if (conditions.length === 0) {
    return true;
  }

  if (match === "all") {
    return conditions.every((condition) => matchCondition(condition, answers, derived));
  }

  return conditions.some((condition) => matchCondition(condition, answers, derived));
}

export function deriveAttributes(answers: AnswersMap): DerivedMap {
  const derived: DerivedMap = {};

  const goal = answers.goal;
  const context = answers.context;
  const timePerDay = answers.time_per_day;
  const injuries = answers.injuries;
  const stress = answers.stress;
  const barrier = answers.barrier;
  const level = answers.level;

  if (typeof goal === "string") {
    derived.goal_family = goal;
  }

  if (typeof context === "string") {
    derived.context_family = context;
    derived.home_user = context === "home";
    derived.gym_user = context === "gym";
    derived.outdoor_user = context === "outdoor";
  }

  if (typeof timePerDay === "string") {
    if (timePerDay === "10_15") {
      derived.time_bucket = "short";
    } else if (timePerDay === "20_30") {
      derived.time_bucket = "medium";
    } else if (timePerDay === "45_plus") {
      derived.time_bucket = "long";
    }
  }

  if (typeof injuries === "string") {
    derived.needs_low_impact = injuries === "knee" || injuries === "back" || injuries === "other";
  }

  if (Array.isArray(injuries)) {
    derived.needs_low_impact = injuries.includes("knee") || injuries.includes("back") || injuries.includes("other");
  }

  if (typeof stress === "string") {
    derived.stress_high = stress === "high";
    derived.stress_medium_or_high = stress === "medium" || stress === "high";
  }

  if (typeof barrier === "string") {
    derived.primary_barrier = barrier;
    derived.time_limited = barrier === "lack_of_time";
    derived.motivation_low = barrier === "low_motivation";
    derived.barrier_is_stress = barrier === "stress";
    derived.barrier_is_pain = barrier === "pain";
  }

  if (typeof level === "string") {
    derived.level_group = level;
    derived.beginner_user = level === "beginner";
  }

  if (typeof goal === "string" && typeof context === "string") {
    derived.persona_code = `${goal}:${context}`;
  }

  return derived;
}

export function getNodeMap(config: JourneyConfig): Map<string, Node> {
  return new Map(config.nodes.map((node) => [node.id, node]));
}

export function getOptionsForNode(
  nodeId: string,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): RenderableOption[] {
  return config.options
    .filter((option) => option.nodeId === nodeId)
    .filter((option) => {
      if (!option.conditions || option.conditions.length === 0) {
        return true;
      }

      return matchConditions(option.conditions, "all", answers, derived);
    })
    .sort((left, right) => left.order - right.order)
    .map((option) => ({
      id: option.id,
      labelUk: option.labelUk,
      value: option.value,
      order: option.order
    }));
}

function toQuestionPayload(
  node: QuestionNode,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): QuestionNodePayload {
  return {
    id: node.id,
    type: "question",
    key: node.key,
    inputType: node.inputType,
    titleUk: node.titleUk,
    subtitleUk: node.subtitleUk,
    descriptionUk: node.descriptionUk,
    ui: node.ui,
    options: getOptionsForNode(node.id, config, answers, derived)
  };
}

function toInfoPayload(node: InfoNode): NodePayload {
  return {
    id: node.id,
    type: "info",
    titleUk: node.titleUk,
    subtitleUk: node.subtitleUk,
    descriptionUk: node.descriptionUk,
    ui: node.ui
  };
}

export function getNodePayload(
  nodeId: string,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): NodePayload {
  const node = config.nodes.find((item) => item.id === nodeId);

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (node.type === "question") {
    return toQuestionPayload(node, config, answers, derived);
  }

  return toInfoPayload(node);
}

export function getOutgoingEdges(nodeId: string, config: JourneyConfig): Edge[] {
  return config.edges
    .filter((edge) => edge.fromNodeId === nodeId)
    .sort((left, right) => {
      if ((left.isFallback ?? false) !== (right.isFallback ?? false)) {
        return left.isFallback ? 1 : -1;
      }

      return right.priority - left.priority;
    });
}

export function resolveNextNodeId(
  currentNodeId: string,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): string | null {
  const edges = getOutgoingEdges(currentNodeId, config);

  for (const edge of edges) {
    if (edge.isFallback) {
      continue;
    }

    const matched = matchConditions(edge.conditions, edge.match, answers, derived);

    if (matched) {
      return edge.toNodeId;
    }
  }

  const fallbackEdge = edges.find((edge) => edge.isFallback);
  return fallbackEdge?.toNodeId ?? null;
}

export function isQuestionNode(node: Node): node is QuestionNode {
  return node.type === "question";
}

export function isInfoNode(node: Node): node is InfoNode {
  return node.type === "info";
}

export function shouldKeepAnswerValue(
  questionKey: string,
  node: Node,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): boolean {
  if (!isQuestionNode(node)) {
    return true;
  }

  if (node.key !== questionKey) {
    return true;
  }

  const availableOptions = getOptionsForNode(node.id, config, answers, derived).map((option) => option.value);

  const actualValue = answers[questionKey];

  if (actualValue === undefined) {
    return true;
  }

  if (Array.isArray(actualValue)) {
    return actualValue.every((value) => availableOptions.includes(value));
  }

  return availableOptions.includes(actualValue);
}

export function sanitizeAnswersAgainstVisibleOptions(
  config: JourneyConfig,
  answers: AnswersMap
): AnswersMap {
  let nextAnswers: AnswersMap = { ...answers };
  let nextDerived = deriveAttributes(nextAnswers);

  for (const node of config.nodes) {
    if (!isQuestionNode(node)) {
      continue;
    }

    const currentValue = nextAnswers[node.key];

    if (currentValue === undefined) {
      continue;
    }

    if (!shouldKeepAnswerValue(node.key, node, config, nextAnswers, nextDerived)) {
      delete nextAnswers[node.key];
      nextDerived = deriveAttributes(nextAnswers);
    }
  }

  return nextAnswers;
}

export function buildReachablePath(
  config: JourneyConfig,
  answers: AnswersMap
): string[] {
  const sanitizedAnswers = sanitizeAnswersAgainstVisibleOptions(config, answers);
  const derived = deriveAttributes(sanitizedAnswers);
  const path: string[] = [];
  const visited = new Set<string>();

  let currentNodeId: string | null = config.journey.startNodeId;

  while (currentNodeId && !visited.has(currentNodeId)) {
    path.push(currentNodeId);
    visited.add(currentNodeId);

    const node = config.nodes.find((item) => item.id === currentNodeId);

    if (!node) {
      break;
    }

    if (node.type === "question") {
      const answerValue = sanitizedAnswers[node.key];
      if (answerValue === undefined) {
        break;
      }
    }

    currentNodeId = resolveNextNodeId(currentNodeId, config, sanitizedAnswers, derived);
  }

  return path;
}

export function findPreviousNodeId(
  currentNodeId: string,
  config: JourneyConfig,
  answers: AnswersMap
): string | null {
  const path = buildReachablePath(config, answers);
  const index = path.findIndex((nodeId) => nodeId === currentNodeId);

  if (index <= 0) {
    return null;
  }

  return path[index - 1] ?? null;
}

export function recomputeFlowState(
  config: JourneyConfig,
  answers: AnswersMap
): {
  answers: AnswersMap;
  derived: DerivedMap;
  visitedNodeIds: string[];
  currentNodeId: string | null;
} {
  const sanitizedAnswers = sanitizeAnswersAgainstVisibleOptions(config, answers);
  const derived = deriveAttributes(sanitizedAnswers);
  const visitedNodeIds = buildReachablePath(config, sanitizedAnswers);
  const currentNodeId = visitedNodeIds.length > 0 ? visitedNodeIds[visitedNodeIds.length - 1] : null;

  return {
    answers: sanitizedAnswers,
    derived,
    visitedNodeIds,
    currentNodeId
  };
}
