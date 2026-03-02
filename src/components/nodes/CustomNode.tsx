import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node, NodeResizer, useReactFlow } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

type CustomNodeProps = NodeProps<Node<RoadmapNodeData>>;

const shapeStyles = {
    default: "rounded-lg border shadow-md",
    input: "rounded-lg border shadow-md",
    output: "rounded-lg border shadow-md",
    "start-end": "rounded-full border-2 shadow-md aspect-square flex items-center justify-center text-center",
    decision: "rotate-45 border-2 shadow-md flex items-center justify-center aspect-square",
    project: "rounded-sm border-2 shadow-lg border-l-8",
    roadmapCard: "rounded-lg border shadow-md",
};

// Category-based styling for Railway-inspired look
const categoryStyles = {
    core: "border-l-[5px] border-l-primary bg-card",
    optional: "border-l-[5px] border-l-slate-400 bg-slate-50/80 dark:bg-slate-800/40",
    advanced: "border-l-[5px] border-l-violet-500 bg-violet-50/80 dark:bg-violet-900/30",
    project: "border-l-[5px] border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30",
};



function CustomNodeComponent({ id, data, type, selected }: CustomNodeProps) {
    const { updateNodeData, setNodes, getNode } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);
    const isDecision = type === "decision";
    const shapeClass = shapeStyles[type as keyof typeof shapeStyles] || shapeStyles.default;
    const categoryClass = data.category
        ? categoryStyles[data.category as keyof typeof categoryStyles] || ""
        : "";
    const completedClass = (data.isCompleted || data.quizPassed)
        ? "!border-l-emerald-500 !bg-emerald-50 dark:!bg-emerald-900/30 ring-1 ring-emerald-500/30"
        : "";

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    // Keyboard Resize Handler
    useEffect(() => {
        if (!selected) return;

        const handleResizeKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();

                const currentNode = getNode(id);
                if (!currentNode) return;

                // Default dimensions if not set
                const currentWidth = currentNode.width ?? (currentNode.measured?.width || 150);
                const currentHeight = currentNode.height ?? (currentNode.measured?.height || 50);

                const STEP = 10;
                let newWidth = currentWidth;
                let newHeight = currentHeight;

                switch (e.key) {
                    case "ArrowRight": newWidth += STEP; break;
                    case "ArrowLeft": newWidth = Math.max(50, newWidth - STEP); break;
                    case "ArrowDown": newHeight += STEP; break;
                    case "ArrowUp": newHeight = Math.max(50, newHeight - STEP); break;
                }

                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === id
                            ? { ...n, width: newWidth, height: newHeight, style: { ...n.style, width: newWidth, height: newHeight } }
                            : n
                    )
                );
            }
        };

        window.addEventListener("keydown", handleResizeKeyDown);
        return () => window.removeEventListener("keydown", handleResizeKeyDown);
    }, [selected, id, setNodes, getNode]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flow canvas from catching the click
        setIsEditing(true);
        setEditValue(data.label);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== data.label) {
            updateNodeData(id, { label: editValue });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleBlur();
        }
        if (e.key === "Escape") {
            setIsEditing(false);
            setEditValue(data.label);
        }
    };

    return (
        <div
            className={`
        px-6 py-4 text-card-foreground border-border
        ${shapeClass}
        ${categoryClass}
        ${completedClass}
        ${selected ? "ring-2 ring-primary" : ""}
        min-w-[400px] min-h-[120px] max-h-[120px]
        transition-all duration-200
        relative group
        hover:shadow-lg hover:z-10
        animate-node-appear
      `}
            onDoubleClick={handleDoubleClick}
        >
            {/* Completed Badge (shown when quiz passed) */}
            {(data.isCompleted || data.quizPassed) && (
                <div
                    className="absolute -top-2 -right-2 z-10 p-0.5 rounded-full text-emerald-500 bg-white dark:bg-gray-900 shadow-sm"
                    title="Quiz passed"
                >
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            )}
            <NodeResizer
                isVisible={selected}
                minWidth={50}
                minHeight={50}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-background rounded shadow-sm"
            />

            {/* Handles for snake layout — each position needs source+target variants */}
            {/* Top: target (vertical connector enters from above) */}
            <Handle type="target" position={Position.Top} id="target-top"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />
            {/* Bottom: source (vertical connector exits downward) */}
            <Handle type="source" position={Position.Bottom} id="source-bottom"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />
            {/* Right: source (L→R row exit) + target (R→L row enter) */}
            <Handle type="source" position={Position.Right} id="source-right"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />
            <Handle type="target" position={Position.Right} id="target-right"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />
            {/* Left: target (L→R row enter) + source (R→L row exit) */}
            <Handle type="target" position={Position.Left} id="target-left"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />
            <Handle type="source" position={Position.Left} id="source-left"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />

            {/* Content — horizontal left-aligned layout */}
            <div className={`flex flex-col justify-center h-full w-full ${isDecision ? "-rotate-45" : ""}`}>
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm min-w-[100px]"
                    />
                ) : (
                    <>
                        {/* Row 1: Step number + Title + Time */}
                        <div className="flex items-center justify-between gap-3 w-full">
                            <div className="font-semibold text-base select-none truncate flex items-center gap-2 min-w-0">
                                {data.stepNumber && (
                                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold shrink-0 ${data.isCompleted || data.quizPassed
                                        ? "bg-emerald-500 text-white"
                                        : data.isStartNode
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted-foreground/20 text-muted-foreground"
                                        }`}>
                                        {data.isCompleted || data.quizPassed ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                            data.stepNumber
                                        )}
                                    </span>
                                )}
                                <span className="truncate">{data.label}</span>
                            </div>
                            {data.estimatedTime && !isDecision && type !== "start-end" && (
                                <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap shrink-0">
                                    ⏱ {data.estimatedTime as string}
                                </span>
                            )}
                        </div>
                        {/* Row 2: Short description */}
                        {data.description && !isDecision && type !== "start-end" && (
                            <div className="text-sm text-muted-foreground/80 mt-1 line-clamp-1 select-none pointer-events-none">
                                {data.description}
                            </div>
                        )}
                        {/* Row 3: Phase badge */}
                        {data.phase && !isDecision && type !== "start-end" && (
                            <div className="mt-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded">
                                    {data.phase as string}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export const CustomNode = memo(CustomNodeComponent);
