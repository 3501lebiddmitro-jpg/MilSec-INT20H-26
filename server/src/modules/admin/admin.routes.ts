import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { validateJourneyConfig } from "../../domain/journey/validators.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../../data");
const RAW_SCHEMA_FILE = path.join(DATA_DIR, "flow-schema.json");
const COMPILED_CONFIG_FILE = path.join(DATA_DIR, "journey-config.json");

const JOURNEY_ID = "journey_uk_main";

type RawNode = {
  id: string;
  data?: {
    kind?: "question" | "info" | "offer";
    label?: string;
    subtitle?: string;
    key?: string;
    options?: Array<{
      label: string;
      value: string | number | boolean;
      reward?: string | null;
    }>;
  };
};

type RawEdge = {
  source: string;
  target: string;
  label?: string;
};

function parseEdgeConditions(label?: string) {
  if (!label || !label.trim()) return [];

  const chunks = label
    .split("&&")
    .map((part) => part.trim())
    .filter(Boolean);

  return chunks.flatMap((chunk) => {
    const operators = ["!=", ">=", "<=", "=", ">", "<"];
    const operator = operators.find((candidate) => chunk.includes(candidate));

    if (!operator) return [];

    const [left, right] = chunk.split(operator).map((value) => value.trim());
    if (!left || right === undefined) return [];

    const normalizedValue =
      right === "true" ? true :
      right === "false" ? false :
      !Number.isNaN(Number(right)) && right !== "" ? Number(right) :
      right;

    if (operator === "=") {
      return [{ field: left, operator: "eq", value: normalizedValue }];
    }

    if (operator === "!=") {
      return [{ field: left, operator: "neq", value: normalizedValue }];
    }

    if (operator === ">") {
      return [{ field: left, operator: "gt", value: normalizedValue }];
    }

    if (operator === "<") {
      return [{ field: left, operator: "lt", value: normalizedValue }];
    }

    if (operator === ">=") {
      return [{ field: left, operator: "gte", value: normalizedValue }];
    }

    if (operator === "<=") {
      return [{ field: left, operator: "lte", value: normalizedValue }];
    }

    return [];
  });
}

function buildOfferFromNode(node: RawNode) {
  return {
    id: `offer_${node.id}`,
    code: `offer_${node.id}`,
    category: "primary" as const,
    nameUk: node.data?.label?.trim() || "Ваш персональний план",
    descriptionUk:
      node.data?.subtitle?.trim() ||
      "Ми проаналізували ваші відповіді та підібрали оптимальну рекомендацію.",
    ctaUk: "Почати програму"
  };
}

function compileToJourneyConfig(rawGraph: { nodes?: RawNode[]; edges?: RawEdge[] }) {
  const rawNodes = Array.isArray(rawGraph.nodes) ? rawGraph.nodes : [];
  const rawEdges = Array.isArray(rawGraph.edges) ? rawGraph.edges : [];

  const firstInteractiveNode =
    rawNodes.find((node) => node.data?.kind !== "offer") ?? rawNodes[0];

  if (!firstInteractiveNode) {
    throw new Error("У схемі немає жодного вузла.");
  }

  let questionStepIndex = 1;

  const compiledNodes = rawNodes.map((node) => {
    const kind = node.data?.kind ?? "question";
    const key = node.data?.key?.trim() || node.id;
    const isQuestion = kind === "question";
    const isOffer = kind === "offer";

    return {
      id: node.id,
      journeyId: JOURNEY_ID,
      type: isQuestion ? "question" as const : "info" as const,
      ...(isQuestion ? { key, inputType: "single-select" as const } : {}),
      titleUk: node.data?.label?.trim() || "",
      subtitleUk: node.data?.subtitle?.trim() || "",
      ui: {
        component: "cards" as const,
        progressLabelUk: isQuestion ? `Крок ${questionStepIndex++}` : "",
        nextLabelUk: isOffer ? "Переглянути результат" : "Далі"
      },
      meta: isOffer
        ? {
            kind: "offer",
            offerId: `offer_${node.id}`
          }
        : {
            kind
          }
    };
  });

  const compiledOptions = rawNodes.flatMap((node) => {
    if (node.data?.kind !== "question") return [];

    return (node.data?.options ?? []).map((option, index) => ({
      id: `opt_${node.id}_${index + 1}`,
      nodeId: node.id,
      labelUk: option.label,
      value: option.value,
      order: index + 1,
      meta: option.reward ? { reward: option.reward } : undefined
    }));
  });

  const outgoingCounts = new Map<string, number>();
  for (const edge of rawEdges) {
    outgoingCounts.set(edge.source, (outgoingCounts.get(edge.source) ?? 0) + 1);
  }

  const compiledEdges = rawEdges.map((edge, index) => {
    const conditions = parseEdgeConditions(edge.label);

    return {
      id: `edge_${index + 1}`,
      fromNodeId: edge.source,
      toNodeId: edge.target,
      priority: 100 - index,
      match: "all" as const,
      conditions,
      isFallback: conditions.length === 0
    };
  });

  const offerNodes = rawNodes.filter((node) => node.data?.kind === "offer");
  const compiledOffers = offerNodes.map(buildOfferFromNode);

  if (compiledOffers.length === 0) {
    compiledOffers.push({
      id: "offer_fallback_guaranteed",
      code: "offer_fallback_guaranteed",
      category: "primary",
      nameUk: "Ваш персональний план готовий",
      descriptionUk: "Ми проаналізували ваші відповіді та підготували базову рекомендацію.",
      ctaUk: "Почати програму"
    });
  }

  const config = {
    journey: {
      id: JOURNEY_ID,
      slug: "wellness-quiz",
      name: "Wellness Quiz",
      locale: "uk" as const,
      status: "published" as const,
      version: Date.now(),
      startNodeId: firstInteractiveNode.id
    },
    nodes: compiledNodes,
    options: compiledOptions,
    edges: compiledEdges,
    offers: compiledOffers
  };

  const validation = validateJourneyConfig(config);
  if (!validation.valid) {
    throw new Error(validation.issues.map((issue) => issue.messageUk).join(" | "));
  }

  return config;
}

router.get("/schema", async (_req, res) => {
  try {
    const content = await fs.readFile(RAW_SCHEMA_FILE, "utf-8");
    res.json(JSON.parse(content));
  } catch {
    res.json(null);
  }
});

router.post("/schema", async (req, res) => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(RAW_SCHEMA_FILE, JSON.stringify(req.body, null, 2), "utf-8");

    const compiled = compileToJourneyConfig(req.body);
    await fs.writeFile(COMPILED_CONFIG_FILE, JSON.stringify(compiled, null, 2), "utf-8");

    res.json({
      success: true,
      journey: compiled.journey,
      nodeCount: compiled.nodes.length,
      optionCount: compiled.options.length,
      edgeCount: compiled.edges.length,
      offerCount: compiled.offers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to compile schema."
    });
  }
});

export const adminRouter = router;