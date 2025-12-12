import type { QuizResultSummary } from "./api";

interface NodeData {
  label?: string;
  description?: string;
  resources?: string[];
  category?: string;
  quizPassed?: boolean;
  isCompleted?: boolean;
  [key: string]: unknown;
}

interface RoadmapNodeLike {
  id: string;
  data?: NodeData;
  [key: string]: unknown;
}

/**
 * Merge quiz results with roadmap nodes.
 * Sets quizPassed and isCompleted to true for nodes that have passed quiz.
 */
export function mergeNodesWithQuizResults<T extends RoadmapNodeLike>(
  nodes: T[],
  quizResults: QuizResultSummary[]
): T[] {
  const passedNodeIds = new Set(
    quizResults.filter((r) => r.passed).map((r) => r.nodeId)
  );

  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      quizPassed: passedNodeIds.has(node.id),
      isCompleted: passedNodeIds.has(node.id),
    },
  }));
}
