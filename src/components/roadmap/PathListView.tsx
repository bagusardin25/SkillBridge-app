import { useMemo } from "react";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  getOrderedLearningNodes,
  isNodeCompleted,
  isNodeLocked,
  getIncompletePrerequisites,
  estimateNodeMinutes,
} from "@/lib/learningUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRoadmapProgress } from "@/lib/learningUtils";

export function PathListView() {
  const {
    nodes,
    edges,
    selectedNodeIds,
    setSelectedNodeIds,
    openDetailPanel,
  } = useRoadmapStore();
  const { t } = useAppLanguage();

  const ordered = useMemo(
    () => getOrderedLearningNodes(nodes, edges),
    [nodes, edges]
  );
  const progress = useMemo(() => getRoadmapProgress(nodes), [nodes]);

  // Group by phase if available
  const groups = useMemo(() => {
    const map = new Map<string, typeof ordered>();
    ordered.forEach((node) => {
      const phase =
        (node.data?.phase as string) ||
        (node.data?.category as string) ||
        t.ux.generalPhase;
      if (!map.has(phase)) map.set(phase, []);
      map.get(phase)!.push(node);
    });
    return Array.from(map.entries());
  }, [ordered, t.ux.generalPhase]);

  const handleSelect = (nodeId: string) => {
    setSelectedNodeIds([nodeId]);
    openDetailPanel();
  };

  if (ordered.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <div className="space-y-2">
          <BookOpen className="mx-auto h-10 w-10 opacity-40" />
          <p className="text-sm">{t.ux.emptyPathList}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-muted/10">
      <div className="shrink-0 border-b bg-background/80 px-3 py-3 backdrop-blur sm:px-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t.ux.pathListTitle}</h2>
          <span className="shrink-0 text-xs text-muted-foreground">
            {progress.completed}/{progress.total} · {progress.percentage}%
          </span>
        </div>
        <Progress value={progress.percentage} className="h-1.5" />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-3 pb-28 sm:p-4 sm:pb-24">
          {groups.map(([phase, phaseNodes]) => (
            <div key={phase} className="space-y-2">
              <h3 className="sticky top-0 z-10 bg-muted/10 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                {phase}
              </h3>
              <ol className="space-y-2">
                {phaseNodes.map((node, index) => {
                  const completed = isNodeCompleted(node);
                  const locked = isNodeLocked(node.id, nodes, edges);
                  const selected = selectedNodeIds.includes(node.id);
                  const prereqs = getIncompletePrerequisites(
                    node.id,
                    nodes,
                    edges
                  );
                  const mins = estimateNodeMinutes(node);

                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(node.id)}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                          "hover:border-primary/40 hover:bg-card hover:shadow-sm",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected && "border-primary bg-primary/5 shadow-sm",
                          completed && "border-emerald-500/30 bg-emerald-500/5",
                          locked && !completed && "opacity-80"
                        )}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center">
                          {completed ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          ) : locked ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/40 text-[10px] font-bold text-primary">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-semibold leading-snug",
                                completed && "text-muted-foreground line-through decoration-emerald-500/50"
                              )}
                            >
                              {node.data?.label || node.id}
                            </p>
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                          </div>

                          {node.data?.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {String(node.data.description)}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {node.data?.category && (
                              <Badge variant="secondary" className="text-[10px] capitalize">
                                {String(node.data.category)}
                              </Badge>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />~{mins} {t.ux.minutes}
                            </span>
                            {locked && prereqs.length > 0 && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                {t.ux.lockedUntil.replace(
                                  "{topics}",
                                  prereqs
                                    .map((p) => p.data?.label || p.id)
                                    .slice(0, 2)
                                    .join(", ")
                                )}
                              </span>
                            )}
                            {!locked && !completed && (
                              <span className="text-[10px] font-medium text-primary">
                                {t.ux.readyToLearn}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
