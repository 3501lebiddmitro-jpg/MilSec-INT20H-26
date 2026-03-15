import { useEffect, useMemo, useState } from "react";
import "../index.css";

type RewardMeta = {
  reward?: string;
};

type QuizOption = {
  id: string;
  labelUk: string;
  value: string | number | boolean;
  order: number;
  meta?: RewardMeta;
};

type QuizNode = {
  id: string;
  type: "question" | "info";
  key?: string;
  titleUk: string;
  subtitleUk?: string;
  descriptionUk?: string;
  options?: QuizOption[];
  ui?: {
    component?: "cards" | "chips" | "input" | "slider";
    progressLabelUk?: string;
    nextLabelUk?: string;
  };
};

type OfferCard = {
  id: string;
  code: string;
  category?: "primary" | "addon" | "cross-sell";
  nameUk: string;
  descriptionUk: string;
  ctaUk: string;
};

type FlowPayload = {
  visitedNodeIds?: string[];
  visitedQuestionNodeIds?: string[];
  totalNodes?: number;
  totalQuestionNodes?: number;
};

type SessionStartResponse = {
  session?: { id: string };
  currentNode?: QuizNode;
  flow?: FlowPayload;
  mode?: "completed";
  result?: { offers?: OfferCard[] };
};

type AnswerResponse = {
  mode?: "next-node" | "completed";
  currentNode?: QuizNode;
  result?: { offers?: OfferCard[] };
  flow?: FlowPayload;
};

type BackResponse = {
  currentNode?: QuizNode;
  flow?: FlowPayload;
};

type RewardItem = {
  id: string;
  image: string;
  popping?: boolean;
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "480px",
    margin: "0 auto"
  },
  hero: {
    padding: "20px 0 24px 0",
    textAlign: "center" as const
  },
  heroTitle: {
    fontSize: "34px",
    fontWeight: 700,
    color: "#4A3F3C",
    fontFamily: "Georgia, serif",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    marginBottom: "16px"
  },
  heroText: {
    fontSize: "16px",
    color: "#5C5452",
    opacity: 0.8,
    lineHeight: "1.4"
  },
  dashboard: {
    background: "#FFFFFF",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(74, 63, 60, 0.05)",
    marginBottom: "24px"
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#4A3F3C"
  },
  progressTrack: {
    height: "8px",
    background: "#F0EAE6",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "16px"
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
  },
  questionTitle: {
    fontSize: "26px",
    fontWeight: 700,
    fontFamily: "Georgia, serif",
    lineHeight: "1.2",
    color: "#4A3F3C",
    margin: 0
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px"
  },
  navRow: {
    marginTop: "32px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px"
  },
  primaryButton: {
    backgroundColor: "#4A3F3C",
    color: "#FFF",
    border: "none",
    borderRadius: "30px",
    padding: "20px",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s"
  },
  secondaryButton: {
    background: "transparent",
    border: "none",
    color: "#9C8481",
    fontSize: "15px",
    fontWeight: 500,
    textDecoration: "underline",
    cursor: "pointer",
    padding: "10px"
  }
};

function optionStyle(selected: boolean) {
  return {
    width: "100%",
    padding: "18px 20px",
    borderRadius: "16px",
    border: selected ? "2px solid #4A3F3C" : "1px solid #EAEAEA",
    background: selected ? "rgba(156, 132, 129, 0.04)" : "#FFF",
    color: "#4A3F3C",
    fontSize: "16px",
    fontWeight: selected ? "600" : "400",
    textAlign: "left" as const,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease"
  };
}

function buildPraise(node: QuizNode | null): string | null {
  if (!node) return null;
  if (node.key === "goal") return "Ми не просто поставимо кілька питань, а сформуємо персональний маршрут.";
  if (node.key === "context") return "Місце тренування дуже важливе для підбору правильного інвентарю.";
  if (node.key === "barrier") return "Бар'єри допомагають точніше підібрати програму, яку реально пройти до кінця.";
  if (node.key === "stress") return "Рівень стресу впливає на темп, навантаження та формат рекомендації.";
  if (node.type === "info") return "Ми вже готові показати персональний результат.";
  return "Ця відповідь допоможе нам зробити план максимально точним.";
}

function buildRewardListFromNode(node: QuizNode | null, selectedValue: unknown): RewardItem[] {
  if (!node?.options || selectedValue === null || selectedValue === undefined) return [];
  const selectedOption = node.options.find((option) => option.value === selectedValue);
  const rewardImage = selectedOption?.meta?.reward;
  if (!rewardImage) return [];
  return [{ id: node.id, image: rewardImage }];
}

function applyFlowState(
  flow: FlowPayload | undefined,
  setVisitedNodeIds: (value: string[]) => void,
  setVisitedQuestionNodeIds: (value: string[]) => void,
  setTotalNodes: (value: number) => void,
  setTotalQuestionNodes: (value: number) => void
) {
  setVisitedNodeIds(flow?.visitedNodeIds ?? []);
  setVisitedQuestionNodeIds(flow?.visitedQuestionNodeIds ?? []);
  setTotalNodes(flow?.totalNodes ?? 0);
  setTotalQuestionNodes(flow?.totalQuestionNodes ?? 0);
}

const StarWithPopup = ({ text }: { text: string }) => {
  const starImg = "https://img.icons8.com/emoji/48/sparkles.png";

  return (
    <div className="star-wrapper">
      <img src={starImg} alt="star" className="star-icon" />
      <div className="star-popup">{text}</div>
    </div>
  );
};

export function QuizApp() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [node, setNode] = useState<QuizNode | null>(null);
  const [offers, setOffers] = useState<OfferCard[] | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | number | boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);

  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [visitedQuestionNodeIds, setVisitedQuestionNodeIds] = useState<string[]>([]);
  const [totalNodes, setTotalNodes] = useState(0);
  const [totalQuestionNodes, setTotalQuestionNodes] = useState(0);

  useEffect(() => {
    let active = true;

    async function startSession() {
      try {
        setIsLoading(true);
        setErrorText(null);

        const response = await fetch("http://localhost:3000/api/session", {
          method: "POST"
        });

        const data: SessionStartResponse = await response.json();

        if (!active) return;

        setSessionId(data.session?.id ?? null);
        setNode(data.currentNode ?? null);
        setOffers(data.mode === "completed" ? data.result?.offers ?? [] : null);

        applyFlowState(
          data.flow,
          setVisitedNodeIds,
          setVisitedQuestionNodeIds,
          setTotalNodes,
          setTotalQuestionNodes
        );
      } catch {
        if (!active) return;
        setErrorText("Не вдалося завантажити квіз.");
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    }

    startSession();

    return () => {
      active = false;
    };
  }, []);

  const progress = useMemo(() => {
    if (totalQuestionNodes > 0) {
      const raw = (visitedQuestionNodeIds.length / totalQuestionNodes) * 100;
      return Math.max(0, Math.min(100, raw));
    }

    if (totalNodes > 0) {
      const raw = (visitedNodeIds.length / totalNodes) * 100;
      return Math.max(0, Math.min(100, raw));
    }

    return 0;
  }, [totalNodes, totalQuestionNodes, visitedNodeIds, visitedQuestionNodeIds]);

  const praise = useMemo(() => buildPraise(node), [node]);

  async function handleNext() {
    if (selectedValue === null || selectedValue === undefined || !sessionId || !node) return;

    const rewardItems = buildRewardListFromNode(node, selectedValue);
    const rewardImage = rewardItems[0]?.image;

    if (rewardImage) {
      setFlyingImage(rewardImage);
    }

    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: node.id, value: selectedValue })
      });

      const data: AnswerResponse = await response.json();

      if (rewardImage) {
        setTimeout(() => {
          setRewards((prev) => {
            const filtered = prev.filter((reward) => reward.id !== node.id);
            return [...filtered, ...rewardItems];
          });
          setFlyingImage(null);
        }, 700);
      }

      const updateUi = () => {
        applyFlowState(
          data.flow,
          setVisitedNodeIds,
          setVisitedQuestionNodeIds,
          setTotalNodes,
          setTotalQuestionNodes
        );

        if (data.mode === "completed") {
          setOffers(data.result?.offers ?? []);
          setNode(null);
          setSelectedValue(null);
          setIsLoading(false);
          return;
        }

        setNode(data.currentNode ?? null);
        setSelectedValue(null);
        setIsLoading(false);
      };

      if (rewardImage) {
        setTimeout(updateUi, 800);
      } else {
        updateUi();
      }
    } catch {
      setFlyingImage(null);
      setIsLoading(false);
      setErrorText("Не вдалося зберегти відповідь.");
    }
  }

  async function handleContinueInfo() {
    if (!sessionId || !node) return;

    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/continue`, {
        method: "POST"
      });

      const data: AnswerResponse = await response.json();

      applyFlowState(
        data.flow,
        setVisitedNodeIds,
        setVisitedQuestionNodeIds,
        setTotalNodes,
        setTotalQuestionNodes
      );

      if (data.mode === "completed") {
        setOffers(data.result?.offers ?? []);
        setNode(null);
      } else {
        setNode(data.currentNode ?? null);
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setErrorText("Не вдалося продовжити квіз.");
    }
  }

  async function handleBack() {
    if (!sessionId) return;

    setIsLoading(true);
    setErrorText(null);

    try {
      if (rewards.length > 0) {
        setRewards((prev) =>
          prev.map((reward, index) =>
            index === prev.length - 1 ? { ...reward, popping: true } : reward
          )
        );
      }

      const response = await fetch(`http://localhost:3000/api/session/${sessionId}/back`, {
        method: "POST"
      });

      const data: BackResponse = await response.json();

      setTimeout(() => {
        if (rewards.length > 0) {
          setRewards((prev) => prev.slice(0, Math.max(prev.length - 1, 0)));
        }

        setNode(data.currentNode ?? null);
        setSelectedValue(null);

        applyFlowState(
          data.flow,
          setVisitedNodeIds,
          setVisitedQuestionNodeIds,
          setTotalNodes,
          setTotalQuestionNodes
        );

        setIsLoading(false);
      }, rewards.length > 0 ? 350 : 0);
    } catch {
      setIsLoading(false);
      setErrorText("Не вдалося повернутися до попереднього питання.");
    }
  }

  if (isLoading && !node && !offers) {
    return <div style={{ padding: "50px", textAlign: "center", color: "#5C5452" }}>Завантаження...</div>;
  }

  if (errorText && !node && !offers) {
    return <div style={{ padding: "50px", textAlign: "center", color: "#5C5452" }}>{errorText}</div>;
  }

  if (offers) {
    const mainOffers = offers.filter((offer) => offer.category === "primary");
    const offerToDisplay = mainOffers.length > 0 ? mainOffers[0] : offers[0];

    return (
      <div style={styles.container}>
        <header style={styles.hero}>
          <h1 style={styles.heroTitle}>Ваш план готовий</h1>
          <p style={styles.heroText}>Ми підібрали найкраще рішення на основі ваших відповідей</p>
        </header>

        {offerToDisplay ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={styles.card}>
              <h2 style={{ ...styles.questionTitle, fontSize: "24px", marginBottom: "12px" }}>
                {offerToDisplay.nameUk}
              </h2>
              <p
                style={{
                  color: "#5C5452",
                  marginBottom: "28px",
                  lineHeight: "1.6",
                  fontSize: "15px"
                }}
              >
                {offerToDisplay.descriptionUk}
              </p>
              <button style={{ ...styles.primaryButton, width: "100%" }}>
                {offerToDisplay.ctaUk}
              </button>
            </div>

            {offers.filter((offer) => offer.id !== offerToDisplay.id).length > 0 && (
              <div style={styles.card}>
                <h3
                  style={{
                    color: "#4A3F3C",
                    fontSize: "20px",
                    marginTop: 0,
                    marginBottom: "16px",
                    fontFamily: "Georgia, serif"
                  }}
                >
                  Додаткові рекомендації
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {offers
                    .filter((offer) => offer.id !== offerToDisplay.id)
                    .map((offer) => (
                      <div
                        key={offer.id}
                        style={{
                          border: "1px solid #EFE7E3",
                          borderRadius: "18px",
                          padding: "16px"
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#4A3F3C",
                            marginBottom: "8px"
                          }}
                        >
                          {offer.nameUk}
                        </div>

                        <div
                          style={{
                            color: "#5C5452",
                            lineHeight: "1.5",
                            fontSize: "14px"
                          }}
                        >
                          {offer.descriptionUk}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ ...styles.card, textAlign: "center" }}>
            <p style={{ color: "#5C5452", marginBottom: "20px" }}>
              На жаль, ми не змогли підібрати план.
            </p>
            <button
              style={{ ...styles.primaryButton, width: "100%" }}
              onClick={() => window.location.reload()}
            >
              Почати заново
            </button>
          </div>
        )}
      </div>
    );
  }

  const isInfoNode = node?.type === "info";

  return (
    <div style={styles.container}>
      {flyingImage && <img src={flyingImage} className="reward-fly-animation" alt="reward" />}

      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>Твій шлях до балансу</h1>
        <p style={styles.heroText}>Аналізуємо ваші відповіді для створення ідеальної програми</p>
      </header>

      <div style={styles.dashboard}>
        <div style={styles.progressInfo}>
          <span>{node?.ui?.progressLabelUk || "Ваш профіль"}</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #D6C4B8 0%, #B8C5D6 100%)",
              transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          />
        </div>

        <div className="rewards-bar">
          {rewards.length === 0 && (
            <span style={{ fontSize: "13px", color: "#9C8481" }}>
              Ваші нагороди з'являться тут
            </span>
          )}
          {rewards.map((reward, index) => (
            <img
              key={`${reward.id}-${index}`}
              src={reward.image}
              className={`reward-icon ${reward.popping ? "pop-out" : "pop-in"}`}
              alt="reward"
            />
          ))}
        </div>
      </div>

      <main style={styles.card}>
        <div className="question-header">
          <h2 style={styles.questionTitle}>{node?.titleUk}</h2>
          {praise && <StarWithPopup text={praise} />}
        </div>

        {!!node?.subtitleUk && (
          <p style={{ color: "#5C5452", lineHeight: "1.5", marginTop: "10px", marginBottom: "18px" }}>
            {node.subtitleUk}
          </p>
        )}

        {!isInfoNode && (
          <div style={styles.optionsGrid}>
            {node?.options?.map((option) => (
              <button
                key={option.id}
                style={optionStyle(selectedValue === option.value)}
                onClick={() => setSelectedValue(option.value)}
              >
                <span>{option.labelUk}</span>
                {selectedValue === option.value && (
                  <span style={{ fontWeight: "bold", color: "#4A3F3C" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {isInfoNode && (
          <div
            style={{
              marginTop: "18px",
              color: "#5C5452",
              lineHeight: "1.6",
              fontSize: "15px"
            }}
          >
            {node?.descriptionUk || "Натисніть кнопку нижче, щоб продовжити."}
          </div>
        )}

        {errorText && (
          <div style={{ marginTop: "14px", color: "#A05A54", fontSize: "14px" }}>
            {errorText}
          </div>
        )}

        <div style={styles.navRow}>
          {!isInfoNode ? (
            <button
              style={{
                ...styles.primaryButton,
                opacity: selectedValue === null || selectedValue === undefined || isLoading ? 0.5 : 1
              }}
              onClick={handleNext}
              disabled={selectedValue === null || selectedValue === undefined || isLoading}
            >
              {isLoading ? "Обробка..." : node?.ui?.nextLabelUk || "Далі"}
            </button>
          ) : (
            <button
              style={{
                ...styles.primaryButton,
                opacity: isLoading ? 0.5 : 1
              }}
              onClick={handleContinueInfo}
              disabled={isLoading}
            >
              {isLoading ? "Обробка..." : node?.ui?.nextLabelUk || "Далі"}
            </button>
          )}

          <button
            style={{
              ...styles.secondaryButton,
              opacity: visitedNodeIds.length <= 1 || isLoading ? 0.5 : 1,
              pointerEvents: visitedNodeIds.length <= 1 || isLoading ? "none" : "auto"
            }}
            onClick={handleBack}
          >
            Назад
          </button>
        </div>
      </main>
    </div>
  );
}