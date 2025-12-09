import dagre from "dagre";
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";
import type { GeneratedRoadmap, RoadmapNode as ApiNode } from "@/lib/api";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const BRANCH_OFFSET_X = 280; // Horizontal offset for branch nodes

export function convertToReactFlowNodes(
  roadmap: GeneratedRoadmap
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 120 });

  // Separate core and branch nodes
  const coreNodes = roadmap.nodes.filter(
    (n) => !n.category || n.category === "core"
  );
  const branchNodes = roadmap.nodes.filter(
    (n) => n.category && n.category !== "core"
  );

  // Add only core nodes to dagre for main path layout
  coreNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add only main edges (between core nodes) to dagre
  const mainEdges = roadmap.edges.filter(
    (edge) => edge.edgeType === "main" || !edge.edgeType
  );
  mainEdges.forEach((edge) => {
    // Only add edge if both source and target are core nodes
    const sourceIsCore = coreNodes.some((n) => n.id === edge.source);
    const targetIsCore = coreNodes.some((n) => n.id === edge.target);
    if (sourceIsCore && targetIsCore) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // Calculate layout for core nodes
  dagre.layout(dagreGraph);

  // Track branch positions (alternate left/right)
  const branchPositions: Map<string, { x: number; y: number }> = new Map();
  let leftBranchCount = 0;
  let rightBranchCount = 0;

  // Position branch nodes relative to their parent core node
  branchNodes.forEach((branchNode) => {
    // Find the parent core node (source of edge to this branch)
    const parentEdge = roadmap.edges.find((e) => e.target === branchNode.id);
    if (parentEdge) {
      const parentNode = dagreGraph.node(parentEdge.source);
      if (parentNode) {
        // Alternate between left and right
        const isLeft = leftBranchCount <= rightBranchCount;
        const offsetX = isLeft ? -BRANCH_OFFSET_X : BRANCH_OFFSET_X;
        
        branchPositions.set(branchNode.id, {
          x: parentNode.x + offsetX,
          y: parentNode.y,
        });

        if (isLeft) leftBranchCount++;
        else rightBranchCount++;
      }
    }
  });

  // Convert to React Flow nodes with positions
  const nodes: RoadmapNode[] = roadmap.nodes.map((node: ApiNode) => {
    let position: { x: number; y: number };

    if (!node.category || node.category === "core") {
      // Core node - use dagre position
      const nodeWithPosition = dagreGraph.node(node.id);
      position = {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      };
    } else {
      // Branch node - use calculated position
      const branchPos = branchPositions.get(node.id);
      if (branchPos) {
        position = {
          x: branchPos.x - NODE_WIDTH / 2,
          y: branchPos.y - NODE_HEIGHT / 2,
        };
      } else {
        // Fallback position if no parent found
        position = { x: 0, y: 0 };
      }
    }

    return {
      id: node.id,
      type: node.type,
      position,
      data: {
        label: node.label,
        description: node.data.description,
        resources: node.data.resources,
        category: node.category || "core",
      },
    };
  });

  // Convert edges with edge type info
  const edges: RoadmapEdge[] = roadmap.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.edgeType === "branch",
    style: edge.edgeType === "branch" 
      ? { strokeDasharray: "5,5", stroke: "hsl(var(--muted-foreground))" }
      : undefined,
  }));

  return { nodes, edges };
}

// Helper to check if message is a roadmap generation request
export function isRoadmapRequest(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  const keywords = [
    "roadmap",
    "create roadmap",
    "buat roadmap",
    "generate roadmap",
    "learning path",
    "jalur belajar",
    "cara belajar",
    "how to learn",
    "i want to learn",
    "saya ingin belajar",
    "teach me",
    "ajari saya",
  ];
  
  return keywords.some((keyword) => lowerMsg.includes(keyword));
}
