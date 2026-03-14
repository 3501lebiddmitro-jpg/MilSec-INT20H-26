import { useEffect, useMemo, useState } from "react";

type PrimitiveValue = string | number | boolean;
type AnswerValue = PrimitiveValue | PrimitiveValue[];

type RenderableOption = {
  id: string;
  labelUk: string;
  value: PrimitiveValue;
  order: number;
};

type QuestionNodePayload = {
  id: string;
  type: "question";
  key: string;
  inputType: "single-select" | "multi-select" | "number" | "text";
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: {
    component?: "cards" | "chips" | "input" | "slider";
    progressLabelUk?: string;
    nextLabelUk?: string;
  };
  options: RenderableOption[];
};

type InfoNodePayload = {
  id: string;
  type: "info";
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  ui?: {
    component?: "cards" | "chips" | "input" | "slider";
    progressLabelUk?: string;
    nextLabelUk?: string;
  };
};

type NodePayload = QuestionNodePayload | InfoNodePayload;

type OfferResult = {
  primaryOfferId: string;
  secondaryOfferIds: string[];
  explanationUk: string;
  ctaUk: string;
};

type DashboardReveal = {
  id: string;
  type: "trait" | "score" | "summary" | "badge";
  key: string;
  titleUk: string;
  value: PrimitiveValue | PrimitiveValue[];
  unlockedAt: string;
};

type Session = {
  id: string;
  journeyId: string;
  status: "active" | "completed" | "abandoned";
  answers: Record<string, AnswerValue>;
  derived: Record<string, PrimitiveValue | PrimitiveValue[]>;
  navigation: {
    currentNodeId: string;
    visitedNodeIds: string[];
    history: Array<{
      nodeId: string;
      visitedAt: string;
      answers: Record<string, AnswerValue>;
      derived: Record<string, PrimitiveValue | PrimitiveValue[]>;
    }>;
  };
  dashboard: {
    reveals: DashboardReveal[];
  };
  result?: OfferResult;
  createdAt: string;
  updatedAt: string;
};

type StartSessionResponse = {
  session: Session;
  currentNode: NodePayload;
};

type NextNodeResponse = {
  session: Session;
  mode: "next-node";
  currentNode: NodePayload;
};

type CompletedResponse = {
  session: Session;
  mode: "completed";
  result: OfferResult;
};

type BackResponse = {
  session: Session;
  currentNode: NodePayload;
};

const API_BASE = "http://localhost:3000/api";

const pageStyle: Record<string, string | number> = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #9A6E5B 0px, #9A6E5B 170px, #F4EFE8 170px, #F4EFE8 100%)",
  color: "#2B2B2B"
};

const shellStyle: Record<string, string | number> = {
  maxWidth: "480px",
  margin: "0 auto",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: "18px 16px 24px"
};

const headerStyle: Record<string, string | number> = {
  color: "#FFFFFF",
  paddingTop: "6px",
  paddingBottom: "18px"
};

const titleStyle: Record<string, string | number> = {
  fontSize: "28px",
  fontWeight: 800,
  lineHeight: 1.1,
  marginBottom: "8px"
};

const subtitleStyle: Record<string, string | number> = {
  fontSize: "14px",
  lineHeight: 1.45,
  color: "rgba(255,255,255,0.88)"
};

const medalsRowStyle: Record<string, string | number> = {
  display: "flex",
  gap: "8px",
  marginTop: "14px",
  flexWrap: "wrap"
};

const medalStyle: Record<string, string | number> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#FFFFFF",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  backdropFilter: "blur(4px)"
};

const contentStyle: Record<string, string | number> = {
  display: "grid",
  gap: "14px",
  marginTop: "-12px"
};

const cardStyle: Record<string, string | number> = {
  background: "#FFFFFF",
  borderRadius: "24px",
  boxShadow: "0 12px 30px rgba(85, 59, 43, 0.08)",
  padding: "18px 16px"
};

const dashboardStyle: Record<string, string | number> = {
  ...cardStyle,
  padding: "14px"
};

const dashboardTitleStyle: Record<string, string | number> = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#7A5C4D",
  letterSpacing: "0.02em",
  marginBottom: "10px",
  textTransform: "uppercase"
};

const revealListStyle: Record<string, string | number> = {
  display: "grid",
  gap: "8px"
};

const revealItemStyle: Record<string, string | number> = {
  borderRadius: "16px",
  background: "#F8F3ED",
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const revealLabelStyle: Record<string, string | number> = {
  fontSize: "12px",
  color: "#8A776C",
  fontWeight: 700
};

const revealValueStyle: Record<string, string | number> = {
  fontSize: "14px",
  color: "#2B2B2B",
  fontWeight: 800
};

const progressWrapStyle: Record<string, string | number> = {
  display: "grid",
  gap: "8px"
};

const progressMetaStyle: Record<string, string | number> = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "center"
};

const progressTextStyle: Record<string, string | number> = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#7A5C4D",
  letterSpacing: "0.03em",
  textTransform: "uppercase"
};

const progressTrackStyle: Record<string, string | number> = {
  width: "100%",
  height: "10px",
  background: "#E8DED1",
  borderRadius: "999px",
  overflow: "hidden"
};

const questionCardStyle: Record<string, string | number> = {
  ...cardStyle,
  display: "grid",
  gap: "16px"
};

const questionTitleStyle: Record<string, string | number> = {
  fontSize: "26px",
  lineHeight: 1.15,
  fontWeight: 800
};

const questionSubtitleStyle: Record<string, string | number> = {
  fontSize: "15px",
  color: "#756B63",
  lineHeight: 1.5
};

const optionsGridStyle: Record<string, string | number> = {
  display: "grid",
  gap: "10px"
};

const navRowStyle: Record<string, string | number> = {
  display: "flex",
  gap: "10px",
  marginTop: "2px"
};

const buttonBaseStyle: Record<string, string | number> = {
  border: "none",
  borderRadius: "18px",
  minHeight: "52px",
  padding: "0 16px",
  fontSize: "15px",
  fontWeight: 800,
  cursor: "pointer"
};

const primaryButtonStyle: Record<string, string | number> = {
  ...buttonBaseStyle,
  background: "#7A5C4D",
  color: "#FFFFFF",
  flex: 1
};

const secondaryButtonStyle: Record<string, string | number> = {
  ...buttonBaseStyle,
  background: "#EFE3D3",
  color: "#6D564A",
  minWidth: "104px"
};

const praiseStyle: Record<string, string | number> = {
  borderRadius: "18px",
  background: "linear-gradient(135deg, #F5E9B7 0%, #E7D197 100%)",
  color: "#58462A",
  padding: "14px 14px",
  display: "grid",
  gap: "5px"
};

const praiseTitleStyle: Record<string, string | number> = {
  fontSize: "13px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.03em"
};

const praiseTextStyle: Record<string, string | number> = {
  fontSize: "14px",
  lineHeight: 1.5,
  fontWeight: 700
};

const optionStyle = (selected: boolean): Record<string, string | number> => ({
  border: selected ? "2px solid #7A5C4D" : "1px solid #E8DED1",
  background: selected ? "#F5EEE6" : "#FFFFFF",
  color: "#2B2B2B",
  borderRadius: "18px",
  padding: "16px 14px",
  minHeight: "58px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 700
});

const resultCardStyle: Record<string, string | number> = {
  ...cardStyle,
  display: "grid",
  gap: "14px"
};

const resultBadgeStyle: Record<string, string | number> = {
  display: "inline-flex",
  alignSelf: "flex-start",
  background: "#EFE3D3",
  color: "#7A5C4D",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.03em"
};

function formatRevealValue(value: PrimitiveValue | PrimitiveValue[]): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  const map: Record<string, string> = {
    weight_loss: "Схуднення",
    strength: "Сила",
    flexibility: "Гнучкість",
    endurance: "Витривалість",
    home: "Вдома",
    gym: "У залі",
    outdoor: "Надворі",
    "10_15": "10–15 хвилин",
    "20_30": "20–30 хвилин",
    "45_plus": "45+ хвилин",
    low: "Низький",
    medium: "Середній",
    high: "Високий",
    lack_of_time: "Нестача часу",
    stress: "Стрес",
    low_motivation: "Низька мотивація",
    pain: "Дискомфорт або біль",
    none: "Немає",
    knee: "Коліна",
    back: "Спина",
    other: "Інше",
    beginner: "Початковий",
    intermediate: "Середній",
    advanced: "Просунутий"
  };

  if (typeof value === "string" && map[value]) {
    return map[value];
  }

  return String(value);
}

function buildPraise(session: Session, node: NodePayload | null): string | null {
  const answers = session.answers;

  if (answers.barrier === "lack_of_time") {
    return "Навіть при щільному графіку ви шукаєте можливість подбати про себе. Такий підхід уже виділяє вас серед більшості користувачів.";
  }

  if (answers.context === "home") {
    return "Домашній формат обирають ті, хто реально вміє вбудовувати турботу про себе у повсякденне життя.";
  }

  if (answers.level === "advanced") {
    return "Лише невелика частина користувачів приходить із таким рівнем підготовки. Це сильна база для швидкого прогресу.";
  }

  if (answers.goal === "endurance") {
    return "Ціль на витривалість зазвичай обирають люди з високою внутрішньою дисципліною. Це дуже сильний сигнал.";
  }

  if (answers.stress === "low") {
    return "Схоже, у вас уже є хороша база саморегуляції. Такі користувачі часто проходять програму стабільніше за інших.";
  }

  if (node?.type === "question" && node.key === "goal") {
    return "Ми будемо не просто ставити питання, а поступово відкривати вашу персональну wellness-картину.";
  }

  return null;
}

function buildMedals(session: Session): string[] {
  const medals: string[] = [];

  if (session.answers.goal) {
    medals.push("🏅 Фокус на цілі");
  }

  if (session.answers.context) {
    medals.push("⚽ Рух у своєму ритмі");
  }

  if (session.answers.barrier || session.answers.stress) {
    medals.push("🥇 Чесність із собою");
  }

  return medals.slice(0, 3);
}

async function startSessionRequest(): Promise<StartSessionResponse> {
  const response = await fetch(`${API_BASE}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Не вдалося запустити квіз.");
  }

  return response.json() as Promise<StartSessionResponse>;
}

async function submitAnswerRequest(
  sessionId: string,
  nodeId: string,
  value: AnswerValue
): Promise<NextNodeResponse | CompletedResponse> {
  const response = await fetch(`${API_BASE}/session/${sessionId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nodeId,
      value
    })
  });

  if (!response.ok) {
    throw new Error("Не вдалося зберегти відповідь.");
  }

  return response.json() as Promise<NextNodeResponse | CompletedResponse>;
}

async function goBackRequest(sessionId: string): Promise<BackResponse> {
  const response = await fetch(`${API_BASE}/session/${sessionId}/back`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Не вдалося повернутися назад.");
  }

  return response.json() as Promise<BackResponse>;
}

export function QuizApp() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentNode, setCurrentNode] = useState<NodePayload | null>(null);
  const [result, setResult] = useState<OfferResult | null>(null);
  const [selectedValue, setSelectedValue] = useState<AnswerValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await startSessionRequest();
        setSession(data.session);
        setCurrentNode(data.currentNode);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка запуску.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!session || !currentNode || currentNode.type !== "question") {
      setSelectedValue(null);
      return;
    }

    const savedValue = session.answers[currentNode.key];
    setSelectedValue(savedValue ?? null);
  }, [session, currentNode]);

  const medals = useMemo(() => (session ? buildMedals(session) : []), [session]);
  const praise = useMemo(() => (session && currentNode ? buildPraise(session, currentNode) : null), [session, currentNode]);

  const progress = useMemo(() => {
    if (!session) {
      return 0;
    }

    const raw = session.dashboard.reveals.length;
    return Math.min(100, Math.max(12, raw * 18));
  }, [session]);

  const handleContinueInfo = async () => {
    if (!session || !currentNode || currentNode.type !== "info") {
      return;
    }

    try {
      setBusy(true);
      const response = await submitAnswerRequest(session.id, currentNode.id, true);

      if (response.mode === "completed") {
        setSession(response.session);
        setResult(response.result);
        setCurrentNode(null);
        return;
      }

      setSession(response.session);
      setCurrentNode(response.currentNode);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сталася помилка.");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!session || !currentNode || currentNode.type !== "question" || selectedValue === null) {
      return;
    }

    try {
      setBusy(true);
      const response = await submitAnswerRequest(session.id, currentNode.id, selectedValue);

      if (response.mode === "completed") {
        setSession(response.session);
        setResult(response.result);
        setCurrentNode(null);
        return;
      }

      setSession(response.session);
      setCurrentNode(response.currentNode);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося перейти далі.");
    } finally {
      setBusy(false);
    }
  };

  const handleBack = async () => {
    if (!session) {
      return;
    }

    try {
      setBusy(true);
      const response = await goBackRequest(session.id);
      setSession(response.session);
      setCurrentNode(response.currentNode);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося повернутися назад.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={headerStyle}>
            <div style={titleStyle}>Готуємо ваш шлях</div>
            <div style={subtitleStyle}>Запускаємо персональний wellness-квіз…</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={headerStyle}>
            <div style={titleStyle}>Щось пішло не так</div>
            <div style={subtitleStyle}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <div style={titleStyle}>Ваш персональний план</div>
          <div style={subtitleStyle}>
            Кожна відповідь відкриває частину вашого wellness-профілю
          </div>
          {medals.length > 0 && (
            <div style={medalsRowStyle}>
              {medals.map((medal) => (
                <div key={medal} style={medalStyle}>
                  <span>{medal}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        <main style={contentStyle}>
          <section style={dashboardStyle}>
            <div style={dashboardTitleStyle}>Персональний дашборд</div>

            <div style={progressWrapStyle}>
              <div style={progressMetaStyle}>
                <span style={progressTextStyle}>Прогрес профілю</span>
                <span style={progressTextStyle}>{progress}%</span>
              </div>

              <div style={progressTrackStyle}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #D9C5A1 0%, #7A5C4D 100%)",
                    borderRadius: "999px",
                    transition: "width 240ms ease"
                  }}
                />
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div style={revealListStyle}>
              {session?.dashboard.reveals.length ? (
                session.dashboard.reveals.map((reveal) => (
                  <div key={reveal.id} style={revealItemStyle}>
                    <div style={revealLabelStyle}>{reveal.titleUk}</div>
                    <div style={revealValueStyle}>{formatRevealValue(reveal.value)}</div>
                  </div>
                ))
              ) : (
                <div style={revealItemStyle}>
                  <div style={revealLabelStyle}>Перший інсайт</div>
                  <div style={revealValueStyle}>З’явиться після вашої відповіді</div>
                </div>
              )}
            </div>
          </section>

          {praise && (
            <section style={praiseStyle}>
              <div style={praiseTitleStyle}>Мікроінсайт</div>
              <div style={praiseTextStyle}>{praise}</div>
            </section>
          )}

          {result ? (
            <section style={resultCardStyle}>
              <div style={resultBadgeStyle}>Ваш результат готовий</div>
              <div style={questionTitleStyle}>Персональна рекомендація сформована</div>
              <div style={questionSubtitleStyle}>{result.explanationUk}</div>
              <button type="button" style={primaryButtonStyle}>
                {result.ctaUk}
              </button>
            </section>
          ) : currentNode ? (
            <section style={questionCardStyle}>
              <div style={progressTextStyle}>
                {currentNode.ui?.progressLabelUk ?? "Ваш крок"}
              </div>

              <div>
                <div style={questionTitleStyle}>{currentNode.titleUk}</div>
                {currentNode.subtitleUk && (
                  <div style={{ ...questionSubtitleStyle, marginTop: 8 }}>{currentNode.subtitleUk}</div>
                )}
                {currentNode.descriptionUk && (
                  <div style={{ ...questionSubtitleStyle, marginTop: 8 }}>{currentNode.descriptionUk}</div>
                )}
              </div>

              {currentNode.type === "question" ? (
                <>
                  <div style={optionsGridStyle}>
                    {currentNode.options.map((option) => {
                      const selected = selectedValue === option.value;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          style={optionStyle(selected)}
                          onClick={() => setSelectedValue(option.value)}
                        >
                          <span>{option.labelUk}</span>
                          <span>{selected ? "●" : "○"}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={navRowStyle}>
                    <button
                      type="button"
                      style={secondaryButtonStyle}
                      onClick={handleBack}
                      disabled={busy}
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      style={{
                        ...primaryButtonStyle,
                        opacity: selectedValue === null || busy ? 0.6 : 1
                      }}
                      onClick={handleSubmitQuestion}
                      disabled={selectedValue === null || busy}
                    >
                      {busy ? "Завантаження..." : currentNode.ui?.nextLabelUk ?? "Далі"}
                    </button>
                  </div>
                </>
              ) : (
                <div style={navRowStyle}>
                  <button
                    type="button"
                    style={secondaryButtonStyle}
                    onClick={handleBack}
                    disabled={busy}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={handleContinueInfo}
                    disabled={busy}
                  >
                    {busy ? "Завантаження..." : currentNode.ui?.nextLabelUk ?? "Продовжити"}
                  </button>
                </div>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
