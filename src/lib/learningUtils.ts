import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";

export function isNodeCompleted(node: RoadmapNode): boolean {
  return !!(node.data?.isCompleted || node.data?.quizPassed);
}

export function isLearningNode(node: RoadmapNode): boolean {
  return node.type !== "decision" && node.type !== "start-end";
}

export function getLearningNodes(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.filter(isLearningNode);
}

/** Topological-ish order: by stepNumber, then edge order from roots */
export function getOrderedLearningNodes(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): RoadmapNode[] {
  const learning = getLearningNodes(nodes);
  const byStep = [...learning].sort(
    (a, b) =>
      ((a.data?.stepNumber as number) || 999) -
      ((b.data?.stepNumber as number) || 999)
  );

  // If all have step numbers, use that
  if (byStep.every((n) => typeof n.data?.stepNumber === "number")) {
    return byStep;
  }

  // BFS from nodes with no incoming learning edges
  const idSet = new Set(learning.map((n) => n.id));
  const incoming = new Map<string, number>();
  learning.forEach((n) => incoming.set(n.id, 0));
  edges.forEach((e) => {
    if (idSet.has(e.target) && idSet.has(e.source)) {
      incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
    }
  });

  const queue = learning.filter((n) => (incoming.get(n.id) || 0) === 0);
  const visited = new Set<string>();
  const ordered: RoadmapNode[] = [];
  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!idSet.has(e.source) || !idSet.has(e.target)) return;
    const list = adj.get(e.source) || [];
    list.push(e.target);
    adj.set(e.source, list);
  });

  while (queue.length) {
    const node = queue.shift()!;
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    ordered.push(node);
    for (const nextId of adj.get(node.id) || []) {
      const count = (incoming.get(nextId) || 1) - 1;
      incoming.set(nextId, count);
      if (count <= 0) {
        const next = learning.find((n) => n.id === nextId);
        if (next && !visited.has(nextId)) queue.push(next);
      }
    }
  }

  // Append any disconnected nodes
  learning.forEach((n) => {
    if (!visited.has(n.id)) ordered.push(n);
  });

  return ordered;
}

export function getIncompletePrerequisites(
  nodeId: string,
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): RoadmapNode[] {
  return edges
    .filter((e) => e.target === nodeId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is RoadmapNode => !!n && isLearningNode(n) && !isNodeCompleted(n));
}

export function isNodeLocked(
  nodeId: string,
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): boolean {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node || isNodeCompleted(node)) return false;
  return getIncompletePrerequisites(nodeId, nodes, edges).length > 0;
}

export function getNextRecommendedNode(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): RoadmapNode | null {
  const ordered = getOrderedLearningNodes(nodes, edges);
  for (const node of ordered) {
    if (isNodeCompleted(node)) continue;
    if (!isNodeLocked(node.id, nodes, edges)) return node;
  }
  // Fallback: first incomplete even if locked
  return ordered.find((n) => !isNodeCompleted(n)) || null;
}

export function getRoadmapProgress(nodes: RoadmapNode[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const learning = getLearningNodes(nodes);
  const completed = learning.filter(isNodeCompleted).length;
  const total = learning.length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function estimateNodeMinutes(node: RoadmapNode): number {
  const raw = node.data?.estimatedTime;
  if (typeof raw === "string") {
    const match = raw.match(/(\d+)/);
    if (match) return parseInt(match[1], 10) * (raw.toLowerCase().includes("jam") || raw.toLowerCase().includes("hour") ? 60 : 1);
  }
  if (node.data?.category === "project") return 180;
  if (node.data?.category === "core") return 90;
  return 45;
}

const PENDING_GOAL_KEY = "skillbridge_pending_goal";
const ONBOARDING_KEY = "skillbridge_onboarding_done";

export function setPendingGoal(goal: string) {
  if (goal.trim()) localStorage.setItem(PENDING_GOAL_KEY, goal.trim());
}

export function getPendingGoal(): string | null {
  return localStorage.getItem(PENDING_GOAL_KEY);
}

export function clearPendingGoal() {
  localStorage.removeItem(PENDING_GOAL_KEY);
}

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function setOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export function formatRelativeTime(date: Date, language: "en" | "id" = "en"): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 5) return language === "id" ? "baru saja" : "just now";
  if (sec < 60) return language === "id" ? `${sec}d lalu` : `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return language === "id" ? `${min} mnt lalu` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  return language === "id" ? `${hr} jam lalu` : `${hr}h ago`;
}
