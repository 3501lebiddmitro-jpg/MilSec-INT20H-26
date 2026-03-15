import { getQuestionTemplateByCode, graphInsertionRules, type QuestionTemplate } from "./question-catalog.js";
import type { Edge, JourneyConfig, Node } from "./types.js";

export type ValidationIssue = {
  code: string;
  messageUk: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type AdminQuestionInsertionInput = {
  templateCode: string;
  targetSlot: string;
};

function buildNodeMap(nodes: Node[]): Map<string, Node> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const existing = adjacency.get(edge.fromNodeId) ?? [];
    existing.push(edge.toNodeId);
    adjacency.set(edge.fromNodeId, existing);
  }

  return adjacency;
}

function detectCycle(startNodeId: string, adjacency: Map<string, string[]>): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);

    for (const nextNodeId of adjacency.get(nodeId) ?? []) {
      if (dfs(nextNodeId)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);

    return false;
  }

  return dfs(startNodeId);
}

function findReachableNodeIds(startNodeId: string, adjacency: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || reachable.has(current)) {
      continue;
    }

    reachable.add(current);

    for (const nextNodeId of adjacency.get(current) ?? []) {
      if (!reachable.has(nextNodeId)) {
        queue.push(nextNodeId);
      }
    }
  }

  return reachable;
}

function validateStartNode(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = buildNodeMap(config.nodes);

  if (!config.journey.startNodeId) {
    issues.push({
      code: "missing_start_node",
      messageUk: "У journey відсутній startNodeId."
    });
    return issues;
  }

  if (!nodeMap.has(config.journey.startNodeId)) {
    issues.push({
      code: "start_node_not_found",
      messageUk: "Початковий вузол не існує серед nodes."
    });
  }

  return issues;
}

function validateEdgeTargets(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = buildNodeMap(config.nodes);

  for (const edge of config.edges) {
    if (!nodeMap.has(edge.fromNodeId)) {
      issues.push({
        code: "edge_from_missing",
        messageUk: `Edge ${edge.id} посилається на неіснуючий fromNodeId: ${edge.fromNodeId}.`
      });
    }

    if (!nodeMap.has(edge.toNodeId)) {
      issues.push({
        code: "edge_to_missing",
        messageUk: `Edge ${edge.id} посилається на неіснуючий toNodeId: ${edge.toNodeId}.`
      });
    }
  }

  return issues;
}

function validateQuestionKeys(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const usedKeys = new Set<string>();

  for (const node of config.nodes) {
    if (node.type === "question") {
      if (!node.key) {
        issues.push({
          code: "question_key_missing",
          messageUk: `Question node ${node.id} не має key.`
        });
        continue;
      }

      if (usedKeys.has(node.key)) {
        issues.push({
          code: "duplicate_question_key",
          messageUk: `Question key ${node.key} використовується більше одного разу.`
        });
      }

      usedKeys.add(node.key);
    }
  }

  return issues;
}

function validateCycle(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const adjacency = buildAdjacency(config.edges);

  if (detectCycle(config.journey.startNodeId, adjacency)) {
    issues.push({
      code: "cycle_detected",
      messageUk: "Граф містить цикл, а повинен бути DAG."
    });
  }

  return issues;
}

function validateReachability(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const adjacency = buildAdjacency(config.edges);
  const reachable = findReachableNodeIds(config.journey.startNodeId, adjacency);

  for (const node of config.nodes) {
    if (!reachable.has(node.id)) {
      issues.push({
        code: "unreachable_node",
        messageUk: `Вузол ${node.id} недосяжний із startNodeId.`
      });
    }
  }

  return issues;
}

function validateQuestionOutgoingEdges(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const adjacency = buildAdjacency(config.edges);

  for (const node of config.nodes) {
    if (node.type !== "question") {
      continue;
    }

    const outgoingCount = (adjacency.get(node.id) ?? []).length;

    if (outgoingCount === 0) {
      continue;
    }
  }

  return issues;
}

function validateOptionBindings(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = buildNodeMap(config.nodes);

  for (const option of config.options) {
    const node = nodeMap.get(option.nodeId);

    if (!node) {
      issues.push({
        code: "option_node_missing",
        messageUk: `Option ${option.id} посилається на неіснуючий nodeId: ${option.nodeId}.`
      });
      continue;
    }

    if (node.type !== "question") {
      issues.push({
        code: "option_attached_to_non_question",
        messageUk: `Option ${option.id} прив'язаний до non-question node ${option.nodeId}.`
      });
    }
  }

  return issues;
}

function validateFallbackConflicts(config: JourneyConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const grouped = new Map<string, Edge[]>();

  for (const edge of config.edges) {
    const existing = grouped.get(edge.fromNodeId) ?? [];
    existing.push(edge);
    grouped.set(edge.fromNodeId, existing);
  }

  for (const [fromNodeId, edges] of grouped.entries()) {
    const fallbackEdges = edges.filter((edge) => edge.isFallback);

    if (fallbackEdges.length > 1) {
      issues.push({
        code: "multiple_fallback_edges",
        messageUk: `Вузол ${fromNodeId} має більше одного fallback edge.`
      });
    }

    const priorityPairs = new Set<string>();
    for (const edge of edges) {
      const key = `${edge.priority}:${edge.match}:${JSON.stringify(edge.conditions)}`;
      if (priorityPairs.has(key)) {
        issues.push({
          code: "ambiguous_edge_priority",
          messageUk: `У вузла ${fromNodeId} є потенційно неоднозначні edge з однаковим пріоритетом та умовами.`
        });
        break;
      }
      priorityPairs.add(key);
    }
  }

  return issues;
}

export function validateJourneyConfig(config: JourneyConfig): ValidationResult {
  const issues: ValidationIssue[] = [
    ...validateStartNode(config),
    ...validateEdgeTargets(config),
    ...validateQuestionKeys(config),
    ...validateOptionBindings(config),
    ...validateCycle(config),
    ...validateReachability(config),
    ...validateQuestionOutgoingEdges(config),
    ...validateFallbackConflicts(config)
  ];

  return {
    valid: issues.length === 0,
    issues
  };
}

function isTemplateAllowedInSlot(template: QuestionTemplate, targetSlot: string): boolean {
  const rule = graphInsertionRules.find((item) => item.slot === targetSlot);

  if (!rule) {
    return false;
  }

  if (template.slot !== targetSlot) {
    return false;
  }

  return rule.allowedCategories.includes(template.category);
}

export function validateAdminQuestionInsertion(input: AdminQuestionInsertionInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const template = getQuestionTemplateByCode(input.templateCode);

  if (!template) {
    issues.push({
      code: "template_not_found",
      messageUk: `Шаблон питання ${input.templateCode} не знайдено.`
    });

    return {
      valid: false,
      issues
    };
  }

  if (!isTemplateAllowedInSlot(template, input.targetSlot)) {
    issues.push({
      code: "template_slot_mismatch",
      messageUk: `Питання ${input.templateCode} не можна вставити у слот ${input.targetSlot}.`
    });
  }

  const insertionRule = graphInsertionRules.find((rule) => rule.slot === input.targetSlot);

  if (!insertionRule) {
    issues.push({
      code: "insertion_rule_missing",
      messageUk: `Для слота ${input.targetSlot} не визначено правила вставки.`
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
