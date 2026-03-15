import { useState, useRef } from "react";
import { ReactFlow, Background, Controls, MiniMap, Panel, type OnSelectionChangeParams } from "@xyflow/react";
import { useFlow, type FlowKind } from "./FlowContext";
import { Link } from "react-router-dom";
import "@xyflow/react/dist/style.css";
import "./admin.css";

export default function AdminPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    nodes, edges, isLoading, isSaving, onNodesChange, onEdgesChange, onConnect,
    selectedNode, selectedEdge, setSelectedNodeId, setSelectedEdgeId,
    addNode, updateNode, updateEdge, 
    addNodeOption, updateNodeOption, removeNodeOption,
    saveToServer, exportJson, importJson, resetGraph, graphJson
  } = useFlow();

  const [jsonVisible, setJsonVisible] = useState(false);

  const onSelectionChange = ({ nodes, edges }: OnSelectionChangeParams) => {
    setSelectedNodeId(nodes[0]?.id || null);
    setSelectedEdgeId(edges[0]?.id || null);
  };

  if (isLoading) {
    return (
      <div className="admin-layout" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <h2 style={{color: '#4A3F3C', fontFamily: 'Georgia'}}>Завантаження конфігурації...</h2>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div>
          <span className="admin-eyebrow">Система управління</span>
          <h1 className="admin-title">Конструктор маршрутів</h1>
          <p className="admin-subtitle">Керуйте логікою квиза візуально.</p>
        </div>
        
        <div className="admin-actions">
          <Link to="/admin-simple" className="admin-btn outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            📄 Спрощений список
          </Link>
          <button className="admin-btn outline" onClick={() => addNode("question")}>+ Питання</button>
          <button className="admin-btn outline" onClick={() => addNode("info")}>+ Інфо</button>
          <button className="admin-btn outline" onClick={() => addNode("offer")}>+ Оффер</button>
          
          <button className="admin-btn outline" onClick={() => fileInputRef.current?.click()}>⬆ Імпорт</button>
          <button className="admin-btn outline" onClick={exportJson}>⬇ Експорт</button>
          
          <button className="admin-btn primary" onClick={saveToServer} disabled={isSaving}>
            {isSaving ? "Збереження..." : "💾 Опублікувати"}
          </button>
          <button className="admin-btn danger" onClick={resetGraph}>Скинути</button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={importJson}
          />
        </div>
      </header>

      <main className="admin-workspace">
        <section className="admin-card canvas-card">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            fitView
            deleteKeyCode={["Delete", "Backspace"]}
          >
            <Background color="#D6C4B8" gap={16} />
            <Controls />
            <MiniMap nodeColor={(n) => n.style?.background as string || "#fff"} maskColor="rgba(249, 247, 245, 0.7)" />
            <Panel position="bottom-left">
              <div className="canvas-hint">Оберіть вузол або стрілку для редагування</div>
            </Panel>
          </ReactFlow>
        </section>

        <aside className="admin-sidebar">
          <div className="admin-card">
            <h2 className="sidebar-title">Налаштування</h2>
            
            {selectedNode ? (
              <div className="editor-form">
                <div className="badge-row">
                  <span className="admin-badge node-badge">Вузол</span>
                  <span className="muted-id">{selectedNode.id}</span>
                </div>
                
                {/* СИСТЕМНИЙ КЛЮЧ */}
                <label className="form-group">
                  <span>Системний ключ (goal, stress...)</span>
                  <input className="admin-input" value={selectedNode.data.key || ""} placeholder="Напр. goal" onChange={(e) => updateNode(selectedNode.id, "key", e.target.value)} />
                </label>

                <label className="form-group">
                  <span>Заголовок (Title)</span>
                  <input className="admin-input" value={selectedNode.data.label} onChange={(e) => updateNode(selectedNode.id, "label", e.target.value)} />
                </label>
                <label className="form-group">
                  <span>Підзаголовок (Subtitle)</span>
                  <input className="admin-input" value={selectedNode.data.subtitle || ""} onChange={(e) => updateNode(selectedNode.id, "subtitle", e.target.value)} />
                </label>
                <label className="form-group">
                  <span>Тип вузла</span>
                  <select className="admin-input" value={selectedNode.data.kind} onChange={(e) => updateNode(selectedNode.id, "kind", e.target.value as FlowKind)}>
                    <option value="question">Запитання</option>
                    <option value="info">Інформація</option>
                    <option value="offer">Оффер (Фінал)</option>
                  </select>
                </label>

                {/* ВАРІАНТИ ВІДПОВІДЕЙ */}
                {selectedNode.data.kind === "question" && (
                  <div className="form-group" style={{ marginTop: '16px', borderTop: '1px solid #F0EAE6', paddingTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#9C8481', marginBottom: '8px', display: 'block' }}>Варіанти відповідей (кнопки):</span>
                    
                    {(selectedNode.data.options || []).map((opt, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', background: '#F9F7F5', padding: '8px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <input 
                            className="admin-input" style={{ padding: '8px', fontSize: '12px' }} 
                            placeholder="Текст на кнопці (Напр. Чоловік)" 
                            value={opt.label} 
                            onChange={(e) => updateNodeOption(selectedNode.id, index, 'label', e.target.value)} 
                          />
                          <input 
                            className="admin-input" style={{ padding: '8px', fontSize: '12px', fontFamily: 'monospace' }} 
                            placeholder="Значення (Напр. male)" 
                            value={opt.value} 
                            onChange={(e) => updateNodeOption(selectedNode.id, index, 'value', e.target.value)} 
                          />
                        </div>
                        <button className="admin-btn outline" style={{ padding: '0 12px', color: '#E63946', borderColor: '#F0EAE6' }} onClick={() => removeNodeOption(selectedNode.id, index)}>X</button>
                      </div>
                    ))}
                    
                    <button className="admin-btn outline" style={{ width: '100%', fontSize: '12px', padding: '8px', borderStyle: 'dashed' }} onClick={() => addNodeOption(selectedNode.id)}>
                      + Додати варіант
                    </button>
                  </div>
                )}
              </div>
            ) : selectedEdge ? (
              <div className="editor-form">
                <div className="badge-row">
                  <span className="admin-badge edge-badge">Перехід</span>
                  <span className="muted-id">{selectedEdge.id}</span>
                </div>
                <label className="form-group">
                  <span>Умова (Condition)</span>
                  <input className="admin-input" value={selectedEdge.label || ""} placeholder="Напр. goal = weight_loss" onChange={(e) => updateEdge(selectedEdge.id, e.target.value)} />
                </label>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <p>Клікніть на елемент у схемі, щоб редагувати його.</p>
              </div>
            )}
          </div>

          <div className="admin-card">
             <div className="json-header">
                <h2 className="sidebar-title" style={{margin: 0}}>Схема JSON</h2>
                <button className="text-btn" onClick={() => setJsonVisible(!jsonVisible)}>{jsonVisible ? "Сховати" : "Показати"}</button>
             </div>
             {jsonVisible && <pre className="json-preview">{graphJson}</pre>}
          </div>
        </aside>
      </main>
    </div>
  );
}