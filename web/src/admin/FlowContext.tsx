import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange
} from "@xyflow/react";

export type FlowKind = "info" | "question" | "offer";

export type FlowOption = {
  label: string;
  value: string;
  reward?: string;
};

export type FlowNodeData = {
  label: string;
  kind: FlowKind;
  subtitle?: string;
  options?: FlowOption[];
  key?: string;
};

const baseNodeStyle = {
  width: 240,
  borderRadius: 16,
  padding: 14,
  fontSize: 14,
  fontWeight: 500,
  boxShadow: "0 8px 24px rgba(74, 63, 60, 0.08)"
};

export function getNodeStyle(kind: FlowKind) {
  if (kind === "info") {
    return {
      ...baseNodeStyle,
      border: "2px solid #9C8481",
      background: "#F9F7F5",
      color: "#4A3F3C"
    };
  }

  if (kind === "offer") {
    return {
      ...baseNodeStyle,
      border: "2px solid #4A3F3C",
      background: "#4A3F3C",
      color: "#FFFFFF"
    };
  }

  return {
    ...baseNodeStyle,
    border: "2px solid #D6C4B8",
    background: "#FFFFFF",
    color: "#5C5452"
  };
}

const initialNodes: Node<FlowNodeData>[] = [
  {
    id: "intro",
    position: { x: 0, y: 0 },
    data: {
      label: "Стартове питання",
      kind: "question",
      options: [],
      key: "intro"
    },
    style: getNodeStyle("question")
  }
];

const initialEdges: Edge[] = [];

type FlowContextType = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNode: Node<FlowNodeData> | null;
  selectedEdge: Edge | null;
  isLoading: boolean;
  isSaving: boolean;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange<Node<FlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (params: Connection) => void;
  addNode: (kind: FlowKind) => void;
  updateNode: (id: string, key: keyof FlowNodeData, value: unknown) => void;
  updateEdge: (id: string, label: string) => void;
  addNodeOption: (nodeId: string) => void;
  updateNodeOption: (nodeId: string, index: number, key: keyof FlowOption, value: string) => void;
  removeNodeOption: (nodeId: string, index: number) => void;
  saveToServer: () => Promise<void>;
  resetGraph: () => void;
  graphJson: string;
};

const FlowContext = createContext<FlowContextType | null>(null);

function normalizeNodes(rawNodes: Array<Node<any>>): Node<FlowNodeData>[] {
  return rawNodes.map((node) => ({
    ...node,
    data: {
      label: String(node.data?.label ?? ""),
      kind: (node.data?.kind as FlowKind) || "question",
      subtitle: node.data?.subtitle ? String(node.data.subtitle) : "",
      key: node.data?.key ? String(node.data.key) : node.id,
      options: Array.isArray(node.data?.options)
        ? node.data.options.map((option: any) => ({
            label: String(option?.label ?? ""),
            value: String(option?.value ?? ""),
            reward: option?.reward ? String(option.reward) : ""
          }))
        : []
    },
    style: getNodeStyle((node.data?.kind as FlowKind) || "question")
  }));
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [counter, setCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/admin/schema")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nodes) {
          setNodes(normalizeNodes(data.nodes));
          setEdges(data.edges || []);
          setCounter(data.counter || 1);
        } else {
          setNodes(initialNodes);
          setEdges(initialEdges);
        }
      })
      .catch(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId]
  );

  const onNodesChange = useCallback((changes: NodeChange<Node<FlowNodeData>>[]) => {
    setNodes((current) => applyNodeChanges(changes, current) as Node<FlowNodeData>[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((current) => applyEdgeChanges(changes, current) as Edge[]);
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...params,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#9C8481", strokeWidth: 2 }
        },
        current
      )
    );
  }, []);

  const addNode = useCallback(
    (kind: FlowKind) => {
      const id = `${kind}_${counter}`;
      setNodes((current) => [
        ...current,
        {
          id,
          position: { x: 250, y: 150 },
          data: {
            label: `Новий ${kind}`,
            kind,
            options: [],
            key: id,
            subtitle: ""
          },
          style: getNodeStyle(kind)
        }
      ]);
      setCounter((value) => value + 1);
    },
    [counter]
  );

  const updateNode = useCallback((id: string, key: keyof FlowNodeData, value: unknown) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== id) return node;
        const newData = { ...node.data, [key]: value };
        return {
          ...node,
          data: newData,
          style: key === "kind" ? getNodeStyle(value as FlowKind) : node.style
        };
      })
    );
  }, []);

  const addNodeOption = useCallback((nodeId: string) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                options: [
                  ...(node.data.options || []),
                  { label: "Варіант", value: "val", reward: "" }
                ]
              }
            }
          : node
      )
    );
  }, []);

  const updateNodeOption = useCallback(
    (nodeId: string, index: number, key: keyof FlowOption, value: string) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== nodeId) return node;

          const nextOptions = [...(node.data.options || [])];
          nextOptions[index] = {
            ...nextOptions[index],
            [key]: value
          };

          return {
            ...node,
            data: {
              ...node.data,
              options: nextOptions
            }
          };
        })
      );
    },
    []
  );

  const removeNodeOption = useCallback((nodeId: string, index: number) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                options: (node.data.options || []).filter((_, optionIndex) => optionIndex !== index)
              }
            }
          : node
      )
    );
  }, []);

  const updateEdge = useCallback((id: string, label: string) => {
    setEdges((current) => current.map((edge) => (edge.id === id ? { ...edge, label } : edge)));
  }, []);

  const saveToServer = async () => {
    setIsSaving(true);

    try {
      await fetch("http://localhost:3000/api/admin/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, counter })
      });

      alert("✅ Схему успішно опубліковано!");
    } catch {
      alert("❌ Помилка збереження.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetGraph = useCallback(() => {
    if (window.confirm("Скинути граф?")) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setCounter(1);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  const graphJson = useMemo(() => JSON.stringify({ nodes, edges, counter }, null, 2), [nodes, edges, counter]);

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        selectedNode,
        selectedEdge,
        isLoading,
        isSaving,
        setSelectedNodeId,
        setSelectedEdgeId,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        updateNode,
        updateEdge,
        addNodeOption,
        updateNodeOption,
        removeNodeOption,
        saveToServer,
        resetGraph,
        graphJson
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow error");
  }
  return context;
};