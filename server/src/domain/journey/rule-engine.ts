import type {
  AnswersMap,
  Condition,
  ConditionValue,
  DerivedMap,
  Edge,
  InfoNode,
  JourneyConfig,
  Node,
  NodePayload,
  PrimitiveValue,
  QuestionNode,
  QuestionNodePayload,
  RenderableOption
} from "./types.js";

function toComparableArray(value: unknown): PrimitiveValue[] {
  if (Array.isArray(value)) return value as PrimitiveValue[];
  if (value === undefined || value === null) return [];
  return [value as PrimitiveValue];
}

function getContextValue(field: string, answers: AnswersMap, derived: DerivedMap) {
  if (field in derived) return derived[field];
  return answers[field];
}

function eqOperator(actual: unknown, expected: ConditionValue): boolean {
  if (Array.isArray(actual)) return actual.includes(expected as PrimitiveValue);
  return actual === expected;
}

function neqOperator(actual: unknown, expected: ConditionValue): boolean {
  return !eqOperator(actual, expected);
}

function inOperator(actual: unknown, expected: ConditionValue): boolean {
  if (!Array.isArray(expected)) return false;
  if (Array.isArray(actual)) {
    return actual.some((item) => (expected as PrimitiveValue[]).includes(item));
  }
  return (expected as PrimitiveValue[]).includes(actual as PrimitiveValue);
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
  if (Number.isNaN(left) || Number.isNaN(right)) return false;
  return comparator(left, right);
}

function containsOperator(actual: unknown, expected: ConditionValue): boolean {
  const actualValues = toComparableArray(actual);
  if (Array.isArray(expected)) {
    return (expected as PrimitiveValue[]).some((value) => actualValues.includes(value));
  }
  return actualValues.includes(expected as PrimitiveValue);
}

export function matchCondition(condition: Condition, answers: AnswersMap, derived: DerivedMap): boolean {
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
  if (conditions.length === 0) return true;
  if (match === "all") return conditions.every((condition) => matchCondition(condition, answers, derived));
  return conditions.some((condition) => matchCondition(condition, answers, derived));
}

export function deriveAttributes(answers: AnswersMap): DerivedMap {
  const derived: DerivedMap = {};

  const goal = answers.goal as string | undefined;
  const context = answers.context as string | undefined;
  const stress = answers.stress as string | undefined;
  const timePerDay = answers.time_per_day as string | undefined;
  const injuries = answers.injuries as string | undefined;
  const barrier = answers.barrier as string | undefined;
  const level = answers.level as string | undefined;

  if (goal) {
    derived.goal_family = goal;
    derived.goal_is_weight_loss = goal === "weight_loss";
    derived.goal_is_strength = goal === "strength";
    derived.goal_is_flexibility = goal === "flexibility";
    derived.goal_is_endurance = goal === "endurance";
  }

  if (context) {
    derived.context_family = context;
    derived.home_user = context === "home";
    derived.gym_user = context === "gym";
    derived.outdoor_user = context === "outdoor";
  }

  if (stress) {
    derived.stress_level = stress;
    derived.high_stress = stress === "high";
    derived.medium_stress = stress === "medium";
    derived.low_stress = stress === "low";
  }

  if (injuries) {
    derived.has_injuries = injuries !== "none";
    derived.needs_low_impact = injuries === "knee" || injuries === "back" || injuries === "other";
    derived.low_impact_candidate = injuries === "knee" || injuries === "back" || injuries === "other";
  }

  if (level) {
    derived.level_family = level;
    derived.beginner_user = level === "beginner";
    derived.intermediate_user = level === "intermediate";
    derived.advanced_user = level === "advanced";
  }

  if (goal === "weight_loss" && context === "home") {
    derived.weight_loss_home_candidate = true;
  }

  if (goal === "strength" && context === "gym" && injuries !== "knee" && injuries !== "back") {
    derived.strength_builder_candidate = true;
  }

  if (goal === "endurance" || context === "outdoor") {
    derived.run_5k_candidate = true;
  }

  if (goal === "flexibility") {
    derived.mobility_candidate = true;
  }

  if (stress === "high" || stress === "medium" || barrier === "stress") {
    derived.stress_reset_candidate = true;
  }

  if (timePerDay === "10_15" || barrier === "lack_of_time") {
    derived.quick_fit_candidate = true;
  }

  if (goal && context) {
    derived.persona_code = `${goal}:${context}`;
  }

  return derived;
}

export function getOptionsForNode(
  nodeId: string,
  config: JourneyConfig,
  answers: AnswersMap,
  derived: DerivedMap
): RenderableOption[] {
  return config.options
    .filter((option) => option.nodeId === nodeId)
    .filter((option) => !option.conditions || matchConditions(option.conditions, "all", answers, derived))
    .sort((left, right) => left.order - right.order)
    .map((option) => ({
      id: option.id,
      labelUk: option.labelUk,
      value: option.value,
      order: option.order,
      meta: option.meta
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
  return node.type === "question"
    ? toQuestionPayload(node, config, answers, derived)
    : toInfoPayload(node);
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
    if (edge.isFallback) continue;
    if (matchConditions(edge.conditions, edge.match, answers, derived)) {
      return edge.toNodeId;
    }
  }

  return edges.find((edge) => edge.isFallback)?.toNodeId ?? null;
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
  if (!isQuestionNode(node) || node.key !== questionKey) return true;

  const availableOptions = getOptionsForNode(node.id, config, answers, derived).map((option) => option.value);
  const actualValue = answers[questionKey];

  if (actualValue === undefined) return true;

  if (Array.isArray(actualValue)) {
    return actualValue.every((value) => availableOptions.includes(value));
  }

  return availableOptions.includes(actualValue);
}

export function sanitizeAnswersAgainstVisibleOptions(config: JourneyConfig, answers: AnswersMap): AnswersMap {
  let nextAnswers: AnswersMap = { ...answers };
  let nextDerived = deriveAttributes(nextAnswers);

  for (const node of config.nodes) {
    if (!isQuestionNode(node)) continue;
    if (nextAnswers[node.key] === undefined) continue;

    if (!shouldKeepAnswerValue(node.key, node, config, nextAnswers, nextDerived)) {
      delete nextAnswers[node.key];
      nextDerived = deriveAttributes(nextAnswers);
    }
  }

  return nextAnswers;
}

export function buildReachablePath(config: JourneyConfig, answers: AnswersMap): string[] {
  const sanitizedAnswers = sanitizeAnswersAgainstVisibleOptions(config, answers);
  const path: string[] = [];
  const visited = new Set<string>();

  let currentNodeId: string | null = config.journey.startNodeId;

  while (currentNodeId && !visited.has(currentNodeId)) {
    path.push(currentNodeId);
    visited.add(currentNodeId);

    const node = config.nodes.find((item) => item.id === currentNodeId);
    if (!node) break;

    if (node.type === "question" && sanitizedAnswers[node.key] === undefined) {
      break;
    }

    currentNodeId = resolveNextNodeId(
      currentNodeId,
      config,
      sanitizedAnswers,
      deriveAttributes(sanitizedAnswers)
    );
  }

  return path;
}

export function findPreviousNodeId(currentNodeId: string, config: JourneyConfig, answers: AnswersMap): string | null {
  const path = buildReachablePath(config, answers);
  const index = path.findIndex((nodeId) => nodeId === currentNodeId);
  return index <= 0 ? null : path[index - 1] ?? null;
}

export function recomputeFlowState(config: JourneyConfig, answers: AnswersMap) {
  const sanitizedAnswers = sanitizeAnswersAgainstVisibleOptions(config, answers);
  const derived = deriveAttributes(sanitizedAnswers);
  const visitedNodeIds = buildReachablePath(config, sanitizedAnswers);
  const questionNodeIds = config.nodes.filter((node) => node.type === "question").map((node) => node.id);
  const visitedQuestionNodeIds = visitedNodeIds.filter((nodeId) => questionNodeIds.includes(nodeId));

  return {
    answers: sanitizedAnswers,
    derived,
    visitedNodeIds,
    visitedQuestionNodeIds,
    currentNodeId: visitedNodeIds[visitedNodeIds.length - 1] || null,
    totalNodes: config.nodes.length,
    totalQuestionNodes: questionNodeIds.length
  };
}