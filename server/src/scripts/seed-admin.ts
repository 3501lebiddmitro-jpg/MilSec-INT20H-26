import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { journeyUkSeed as config } from "../seeds/journey.uk.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(process.cwd(), "data"); 
const SCHEMA_FILE = path.join(DATA_DIR, "flow-schema.json");

// Стилі для вузлів
const styleQuestion = { width: 240, borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(74, 63, 60, 0.08)", border: "2px solid #D6C4B8", background: "#FFFFFF", color: "#5C5452" };
const styleInfo = { width: 240, borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(74, 63, 60, 0.08)", border: "2px solid #9C8481", background: "#F9F7F5", color: "#4A3F3C" };
const styleOffer = { width: 240, borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(74, 63, 60, 0.08)", border: "2px solid #4A3F3C", background: "#4A3F3C", color: "#FFFFFF" };

async function migrateTree() {
  const nodes: any[] = [];
  const edges: any[] = [];

  let x = 0; let y = 0;

  for (const node of config.nodes) {
    const nodeOptions = config.options 
      ? config.options.filter((o: any) => o.nodeId === node.id) 
      : (node.options || []);

    const mappedOptions = nodeOptions.map((o: any) => ({
      label: o.labelUk || o.label || "Варіант",
      value: String(o.value)
    }));

    // Визначаємо тип вузла
    const kind = node.type === "offer" ? "offer" : (node.type === "info" ? "info" : "question");
    
    nodes.push({
      id: node.id,
      position: { x, y },
      data: {
        label: node.titleUk || "",
        subtitle: node.subtitleUk || "",
        kind: kind,
        key: node.key || node.id, // ВАЖЛИВО: Переносимо системний ключ для нагород!
        options: mappedOptions
      },
      style: kind === "info" ? styleInfo : (kind === "offer" ? styleOffer : styleQuestion)
    });

    y += 160;
    if (y > 800) { y = 0; x += 300; }
  }

  // Переносимо зв'язки та умови
  config.edges.forEach((edge: any, i: number) => {
    let label = "";
    if (edge.conditions && edge.conditions.length > 0) {
      label = `${edge.conditions[0].field} = ${edge.conditions[0].value}`;
    }
    edges.push({
      id: `e_${i}`,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      label: label,
      markerEnd: { type: "arrowclosed" },
      style: { stroke: "#9C8481", strokeWidth: 2 }
    });
  });

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SCHEMA_FILE, JSON.stringify({ nodes, edges, counter: 300 }, null, 2));
  console.log("✅ УСПІХ! База адмінки flow-schema.json переписана з правильними ключами.");
}

migrateTree();