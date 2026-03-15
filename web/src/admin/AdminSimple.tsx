import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFlow, type FlowKind } from "./FlowContext";
import "./admin.css";

export default function AdminSimple() {
  const {
    nodes,
    edges,
    isLoading,
    isSaving,
    selectedNode,
    selectedEdge,
    setSelectedNodeId,
    setSelectedEdgeId,
    addNode,
    updateNode,
    updateEdge,
    onConnect,
    addNodeOption,
    updateNodeOption,
    removeNodeOption,
    saveToServer,
    resetGraph
  } = useFlow();

  const [nodeSearch, setNodeSearch] = useState("");
  const [edgeSearch, setEdgeSearch] = useState("");
  const [newEdgeSource, setNewEdgeSource] = useState("");
  const [newEdgeTarget, setNewEdgeTarget] = useState("");

  const filteredNodes = useMemo(() => {
    const query = nodeSearch.trim().toLowerCase();
    if (!query) return nodes;

    return nodes.filter((node) => {
      const label = String(node.data.label ?? "").toLowerCase();
      const id = node.id.toLowerCase();
      return label.includes(query) || id.includes(query);
    });
  }, [nodes, nodeSearch]);

  const filteredEdges = useMemo(() => {
    const query = edgeSearch.trim().toLowerCase();
    if (!query) return edges;

    return edges.filter((edge) => {
      const label = String(edge.label ?? "").toLowerCase();
      const id = edge.id.toLowerCase();

      return (
        label.includes(query) ||
        id.includes(query) ||
        edge.source.includes(query) ||
        edge.target.includes(query)
      );
    });
  }, [edges, edgeSearch]);

  const handleSelectNode = (nodeId: string) => {
    setSelectedEdgeId(null);
    setSelectedNodeId(nodeId);
  };

  const handleSelectEdge = (edgeId: string) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edgeId);
  };

  const handleCreateEdge = () => {
    if (!newEdgeSource || !newEdgeTarget) {
      alert("Оберіть Source та Target");
      return;
    }

    onConnect({
      source: newEdgeSource,
      target: newEdgeTarget,
      sourceHandle: null,
      targetHandle: null
    });

    setNewEdgeSource("");
    setNewEdgeTarget("");
  };

  if (isLoading) {
    return (
      <div
        className="admin-layout"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
      >
        <h2>Завантаження конфігурації...</h2>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div>
          <span className="admin-eyebrow">Спрощений режим</span>
          <h1 className="admin-title">Швидкий редактор</h1>
        </div>

        <div className="admin-actions">
          <Link to="/admin" className="admin-btn outline" style={{ textDecoration: "none" }}>
            ⬡ Візуальний граф
          </Link>
          <button className="admin-btn primary" onClick={saveToServer} disabled={isSaving}>
            {isSaving ? "Збереження..." : "💾 Опублікувати"}
          </button>
        </div>
      </header>

      <section
        className="simple-actions-row"
        style={{ padding: "0 24px", marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <button className="admin-btn outline" onClick={() => addNode("question")}>
          + Питання
        </button>
        <button className="admin-btn outline" onClick={() => addNode("info")}>
          + Інфо
        </button>
        <button className="admin-btn outline" onClick={() => addNode("offer")}>
          + Оффер
        </button>
        <button className="admin-btn danger" onClick={resetGraph}>
          Скинути все
        </button>
      </section>

      <main
        className="simple-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "20px", padding: "0 24px" }}
      >
        <section className="admin-card simple-panel">
          <h2 className="sidebar-title">Вузли ({nodes.length})</h2>
          <input
            className="admin-input"
            placeholder="Пошук вузла..."
            value={nodeSearch}
            onChange={(e) => setNodeSearch(e.target.value)}
            style={{ marginBottom: "15px" }}
          />

          <div className="simple-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                className={`simple-list-item ${selectedNode?.id === node.id ? "active" : ""}`}
                onClick={() => handleSelectNode(node.id)}
                style={{
                  textAlign: "left",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  cursor: "pointer"
                }}
              >
                <strong>{node.data.label || node.id}</strong>
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {node.id} | {node.data.kind}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-card simple-panel">
          <h2 className="sidebar-title">Редагування</h2>

          {selectedNode ? (
            <div className="editor-form">
              <div className="badge-row" style={{ marginBottom: "15px" }}>
                <span className="admin-badge node-badge">Вузол: {selectedNode.id}</span>
              </div>

              <label className="form-group">
                <span>Системний ключ</span>
                <input
                  className="admin-input"
                  value={selectedNode.data.key || ""}
                  placeholder="Напр. goal"
                  onChange={(e) => updateNode(selectedNode.id, "key", e.target.value)}
                />
              </label>

              <label className="form-group">
                <span>Заголовок</span>
                <input
                  className="admin-input"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNode(selectedNode.id, "label", e.target.value)}
                />
              </label>

              <label className="form-group">
                <span>Підзаголовок</span>
                <input
                  className="admin-input"
                  value={selectedNode.data.subtitle || ""}
                  onChange={(e) => updateNode(selectedNode.id, "subtitle", e.target.value)}
                />
              </label>

              <label className="form-group">
                <span>Тип вузла</span>
                <select
                  className="admin-input"
                  value={selectedNode.data.kind}
                  onChange={(e) => updateNode(selectedNode.id, "kind", e.target.value as FlowKind)}
                >
                  <option value="question">Запитання</option>
                  <option value="info">Інформація</option>
                  <option value="offer">Оффер (Фінал)</option>
                </select>
              </label>

              {selectedNode.data.kind === "question" && (
                <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "10px"
                    }}
                  >
                    Варіанти відповідей:
                  </span>

                  {(selectedNode.data.options || []).map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "10px",
                        background: "#fcfcfc",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <input
                          className="admin-input"
                          style={{ marginBottom: "5px" }}
                          placeholder="Текст"
                          value={option.label}
                          onChange={(e) =>
                            updateNodeOption(selectedNode.id, index, "label", e.target.value)
                          }
                        />
                        <input
                          className="admin-input"
                          style={{ marginBottom: "5px", fontFamily: "monospace", fontSize: "12px" }}
                          placeholder="Значення"
                          value={option.value}
                          onChange={(e) =>
                            updateNodeOption(selectedNode.id, index, "value", e.target.value)
                          }
                        />
                        <input
                          className="admin-input"
                          style={{ fontFamily: "monospace", fontSize: "12px" }}
                          placeholder="Reward image path, напр. /rewards/run.png"
                          value={option.reward || ""}
                          onChange={(e) =>
                            updateNodeOption(selectedNode.id, index, "reward", e.target.value)
                          }
                        />
                      </div>

                      <button
                        className="admin-btn outline"
                        style={{ color: "red" }}
                        onClick={() => removeNodeOption(selectedNode.id, index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    className="admin-btn outline"
                    style={{ width: "100%", borderStyle: "dashed" }}
                    onClick={() => addNodeOption(selectedNode.id)}
                  >
                    + Додати варіант
                  </button>
                </div>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="editor-form">
              <span className="admin-badge edge-badge">
                Перехід: {selectedEdge.source} ➔ {selectedEdge.target}
              </span>

              <label className="form-group" style={{ marginTop: "15px" }}>
                <span>Умова</span>
                <input
                  className="admin-input"
                  placeholder="Напр. goal = weight_loss"
                  value={String(selectedEdge.label || "")}
                  onChange={(e) => updateEdge(selectedEdge.id, e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="empty-state">Оберіть елемент для редагування</div>
          )}
        </section>

        <section className="admin-card simple-panel">
          <h2 className="sidebar-title">Переходи ({edges.length})</h2>
          <input
            className="admin-input"
            placeholder="Пошук переходу..."
            value={edgeSearch}
            onChange={(e) => setEdgeSearch(e.target.value)}
            style={{ marginBottom: "15px" }}
          />

          <div className="simple-list">
            {filteredEdges.map((edge) => (
              <button
                key={edge.id}
                className={`simple-list-item ${selectedEdge?.id === edge.id ? "active" : ""}`}
                onClick={() => handleSelectEdge(edge.id)}
              >
                <strong>{String(edge.label || "Без умови")}</strong>
                <div style={{ fontSize: "11px" }}>
                  {edge.source} ➔ {edge.target}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "2px solid #eee" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Новий перехід:</h3>

            <select
              className="admin-input"
              style={{ marginBottom: "5px" }}
              value={newEdgeSource}
              onChange={(e) => setNewEdgeSource(e.target.value)}
            >
              <option value="">Звідки...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label || node.id}
                </option>
              ))}
            </select>

            <select
              className="admin-input"
              style={{ marginBottom: "10px" }}
              value={newEdgeTarget}
              onChange={(e) => setNewEdgeTarget(e.target.value)}
            >
              <option value="">Куди...</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label || node.id}
                </option>
              ))}
            </select>

            <button className="admin-btn primary" style={{ width: "100%" }} onClick={handleCreateEdge}>
              З'єднати
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}