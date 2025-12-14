import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { CheckCircle2, Play } from "lucide-react";

type ReadOnlyNodeProps = NodeProps<Node<RoadmapNodeData>>;

const shapeStyles = {
    default: "rounded-lg border shadow-md",
    input: "rounded-lg border shadow-md",
    output: "rounded-lg border shadow-md",
    "start-end": "rounded-full border-2 shadow-md aspect-square flex items-center justify-center text-center",
    decision: "rotate-45 border-2 shadow-md flex items-center justify-center aspect-square",
    project: "rounded-sm border-2 shadow-lg border-l-8",
    roadmapCard: "rounded-lg border shadow-md",
};

// Category-based styling for roadmap.sh style
const categoryStyles = {
    core: "border-l-4 border-l-primary bg-card",
    optional: "border-l-4 border-l-slate-400 bg-slate-50 dark:bg-slate-900/50",
    advanced: "border-l-4 border-l-violet-500 bg-violet-50 dark:bg-violet-900/20",
    project: "border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
};

function ReadOnlyNodeComponent({ data, type }: ReadOnlyNodeProps) {
    const isDecision = type === "decision";
    const shapeClass = shapeStyles[type as keyof typeof shapeStyles] || shapeStyles.default;
    const categoryClass = data.category
        ? categoryStyles[data.category as keyof typeof categoryStyles] || ""
        : "";
    const completedClass = (data.isCompleted || data.quizPassed)
        ? "!border-l-emerald-500 !bg-emerald-50 dark:!bg-emerald-900/30 ring-1 ring-emerald-500/30"
        : "";

    return (
        <div
            className={`
        px-4 py-3 text-card-foreground border-border
        ${shapeClass}
        ${categoryClass}
        ${completedClass}
        h-full w-full
        transition-all duration-200
        relative
      `}
        >
            {/* Step Number Badge */}
            {data.stepNumber && (
                <div
                    className={`absolute -top-3 -left-3 z-10 min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${data.isCompleted || data.quizPassed
                            ? "bg-emerald-500 text-white"
                            : data.isStartNode
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted-foreground/80 text-white"
                        }`}
                    title={`Step ${data.stepNumber}`}
                >
                    {data.isCompleted || data.quizPassed ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                        data.stepNumber
                    )}
                </div>
            )}

            {/* START Badge for first node */}
            {data.isStartNode && !(data.isCompleted || data.quizPassed) && (
                <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md whitespace-nowrap"
                >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    Mulai di sini
                </div>
            )}

            {/* Completed Badge (shown when quiz passed) */}
            {(data.isCompleted || data.quizPassed) && (
                <div
                    className="absolute -top-2 -right-2 z-10 p-0.5 rounded-full text-emerald-500 bg-white dark:bg-gray-900 shadow-sm"
                    title="Quiz passed"
                >
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            )}

            <Handle
                type="target"
                position={Position.Top}
                className={`!bg-primary !border-primary-foreground !w-3 !h-3 ${isDecision ? "-rotate-45 !-top-3" : ""}`}
            />

            {/* Content rotation for decision nodes to keep text straight */}
            <div className={`flex flex-col items-center justify-center h-full w-full ${isDecision ? "-rotate-45" : ""}`}>
                <div className="font-semibold text-base text-center select-none w-full break-words whitespace-pre-wrap drop-shadow-sm">
                    {data.label}
                </div>
                {data.description && !isDecision && type !== "start-end" && (
                    <div className="text-sm text-muted-foreground/90 mt-1 line-clamp-2 select-none pointer-events-none text-center">
                        {data.description}
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={`!bg-primary !border-primary-foreground !w-3 !h-3 ${isDecision ? "-rotate-45 !-bottom-3" : ""}`}
            />

            {/* Add handles for decision nodes (Left/Right) */}
            {isDecision && (
                <>
                    <Handle
                        type="source"
                        position={Position.Left}
                        id="left"
                        className="!bg-primary !border-primary-foreground !w-3 !h-3 -rotate-45 !-left-3"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="right"
                        className="!bg-primary !border-primary-foreground !w-3 !h-3 -rotate-45 !-right-3"
                    />
                </>
            )}
        </div>
    );
}

export const ReadOnlyNode = memo(ReadOnlyNodeComponent);
