import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { getNextRecommendedNode, estimateNodeMinutes } from "@/lib/learningUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NextStepChipProps {
  className?: string;
  onFocusNode?: (nodeId: string) => void;
}

export function NextStepChip({ className, onFocusNode }: NextStepChipProps) {
  const {
    nodes,
    edges,
    setSelectedNodeIds,
    openDetailPanel,
    isFocusMode,
  } = useRoadmapStore();
  const { t } = useAppLanguage();

  const next = useMemo(
    () => getNextRecommendedNode(nodes, edges),
    [nodes, edges]
  );

  if (!next || nodes.length === 0) return null;

  const mins = estimateNodeMinutes(next);
  const label = next.data?.label || next.id;

  const handleContinue = () => {
    setSelectedNodeIds([next.id]);
    openDetailPanel();
    onFocusNode?.(next.id);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-[min(100%,22rem)] items-center gap-2 rounded-full border bg-background/95 p-1.5 pl-2.5 shadow-lg backdrop-blur-md sm:pl-3",
        "border-primary/20 ring-1 ring-primary/10 min-w-0",
        isFocusMode && "mb-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-violet-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.ux.continueLearning}
        </p>
        <p className="truncate text-xs font-semibold">
          {label}
          <span className="ml-1 font-normal text-muted-foreground">
            · ~{mins} {t.ux.minutes}
          </span>
        </p>
      </div>
      <Button
        size="sm"
        className="h-8 shrink-0 rounded-full px-3 text-xs"
        onClick={handleContinue}
      >
        {t.ux.go}
        <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
