export type Locale = "uk";

export type JourneyStatus = "draft" | "published";

export type NodeType = "question" | "info";

export type QuestionInputType = "single-select" | "multi-select" | "number" | "text";

export type MatchType = "all" | "any";

export type ConditionOperator =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains";

export type PrimitiveValue = string | number | boolean;

export type ConditionValue = PrimitiveValue | PrimitiveValue[];

export type AnswerValue = PrimitiveValue | PrimitiveValue[];

export type AnswersMap = Record<string, AnswerValue>;

export type DerivedMap = Record<string, PrimitiveValue | PrimitiveValue[]>;

export type OfferCategory = "primary" | "addon";

export type Journey = {
  id: string;
  slug: string;
  name: string;
  locale: Locale;
  status: JourneyStatus;
  version: number;
  startNodeId: string;
};

export type NodeUI = {
  component?: "cards" | "chips" | "input" | "slider";
  progressLabelUk?: string;
  nextLabelUk?: string;
};

export type QuestionNode = {
  id: string;
  journeyId: string;
  type: "question";
  key: string;
  inputType: QuestionInputType;
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: NodeUI;
  meta?: Record<string, unknown>;
};

export type InfoNode = {
  id: string;
  journeyId: string;
  type: "info";
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: NodeUI;
  meta?: Record<string, unknown>;
};

export type Node = QuestionNode | InfoNode;

export type Condition = {
  field: string;
  operator: ConditionOperator;
  value: ConditionValue;
};

export type Option = {
  id: string;
  nodeId: string;
  labelUk: string;
  value: PrimitiveValue;
  order: number;
  conditions?: Condition[];
};

export type Edge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  priority: number;
  match: MatchType;
  conditions: Condition[];
  isFallback?: boolean;
};

export type Offer = {
  id: string;
  code: string;
  category: OfferCategory;
  nameUk: string;
  descriptionUk: string;
  ctaUk: string;
};

export type OfferResult = {
  primaryOfferId: string;
  secondaryOfferIds: string[];
  explanationUk: string;
  ctaUk: string;
};

export type JourneyConfig = {
  journey: Journey;
  nodes: Node[];
  options: Option[];
  edges: Edge[];
  offers: Offer[];
};

export type RenderableOption = {
  id: string;
  labelUk: string;
  value: PrimitiveValue;
  order: number;
};

export type QuestionNodePayload = {
  id: string;
  type: "question";
  key: string;
  inputType: QuestionInputType;
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: NodeUI;
  options: RenderableOption[];
};

export type InfoNodePayload = {
  id: string;
  type: "info";
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: NodeUI;
};

export type NodePayload = QuestionNodePayload | InfoNodePayload;
