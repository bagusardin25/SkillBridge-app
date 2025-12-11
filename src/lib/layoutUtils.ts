import dagre from "dagre";
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";
import type { GeneratedRoadmap, RoadmapNode as ApiNode } from "@/lib/api";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const BRANCH_OFFSET_X = 280; // Horizontal offset for branch nodes

// Topological sort to calculate step numbers
function calculateStepNumbers(
  nodes: ApiNode[],
  edges: { source: string; target: string }[]
): Map<string, { stepNumber: number; isStartNode: boolean }> {
  const result = new Map<string, { stepNumber: number; isStartNode: boolean }>();
  
  // Build adjacency list and in-degree count
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();
  
  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });
  
  // Count incoming edges
  edges.forEach(edge => {
    const currentInDegree = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, currentInDegree + 1);
    
    const neighbors = adjList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjList.set(edge.source, neighbors);
  });
  
  // Find start nodes (nodes with no incoming edges) - only for core nodes
  const coreNodes = nodes.filter(n => !n.category || n.category === "core");
  const startNodes = coreNodes.filter(node => (inDegree.get(node.id) || 0) === 0);
  
  // BFS to assign step numbers
  const queue: { id: string; step: number }[] = startNodes.map(node => ({ id: node.id, step: 1 }));
  const visited = new Set<string>();
  
  // Mark start nodes
  startNodes.forEach(node => {
    result.set(node.id, { stepNumber: 1, isStartNode: true });
    visited.add(node.id);
  });
  
  let currentStep = 1;
  while (queue.length > 0) {
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;
      const neighbors = adjList.get(current.id) || [];
      
      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          // Check if all predecessors have been visited
          const node = nodes.find(n => n.id === neighborId);
          const isCore = !node?.category || node?.category === "core";
          
          if (isCore) {
            visited.add(neighborId);
            const nextStep = current.step + 1;
            result.set(neighborId, { stepNumber: nextStep, isStartNode: false });
            queue.push({ id: neighborId, step: nextStep });
          }
        }
      });
    }
    currentStep++;
  }
  
  // Handle branch/optional nodes - they share step number with parent
  nodes.forEach(node => {
    if (node.category && node.category !== "core" && !result.has(node.id)) {
      // Find parent edge
      const parentEdge = edges.find(e => e.target === node.id);
      if (parentEdge) {
        const parentStep = result.get(parentEdge.source);
        if (parentStep) {
          result.set(node.id, { stepNumber: parentStep.stepNumber, isStartNode: false });
        }
      }
    }
  });
  
  return result;
}

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

  // Calculate step numbers for all nodes
  const stepNumbers = calculateStepNumbers(roadmap.nodes, roadmap.edges);

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

    // Get step number info
    const stepInfo = stepNumbers.get(node.id);

    return {
      id: node.id,
      type: node.type,
      position,
      data: {
        label: node.label,
        description: node.data.description,
        resources: node.data.resources,
        category: node.category || "core",
        stepNumber: stepInfo?.stepNumber,
        isStartNode: stepInfo?.isStartNode || false,
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
  
  // Exclude question patterns - these are asking ABOUT roadmap, not requesting to CREATE one
  const questionPatterns = [
    "apa ini",
    "ini apa", 
    "ini roadmap",
    "roadmap ini",
    "roadmap apa",
    "roadmapnya apa",
    "tentang apa",
    "what is this",
    "what roadmap",
    "this roadmap",
  ];
  
  if (questionPatterns.some((pattern) => lowerMsg.includes(pattern))) {
    return false;
  }
  
  // Check for CREATION intent (flexible matching)
  const hasCreateIntent = 
    lowerMsg.includes("buat") ||      // buat, buatkan, buatin
    lowerMsg.includes("bikin") ||     // bikin, bikinin
    lowerMsg.includes("create") ||
    lowerMsg.includes("generate") ||
    lowerMsg.includes("ingin belajar") ||
    lowerMsg.includes("mau belajar") ||
    lowerMsg.includes("want to learn") ||
    lowerMsg.includes("cara belajar") ||
    lowerMsg.includes("jalur belajar") ||
    lowerMsg.includes("learning path") ||
    lowerMsg.includes("ajari") ||
    lowerMsg.includes("ajarkan") ||
    lowerMsg.includes("teach me");
  
  // Must also mention roadmap or learning topic
  const hasRoadmapOrLearning = 
    lowerMsg.includes("roadmap") ||
    lowerMsg.includes("belajar");
  
  return hasCreateIntent && hasRoadmapOrLearning;
}
