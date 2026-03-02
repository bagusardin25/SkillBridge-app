import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node, NodeResizer, useReactFlow, NodeToolbar, useStore } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock } from "lucide-react";

type CustomNodeProps = NodeProps<Node<RoadmapNodeData>>;

const shapeStyles: Record<string, string> = {
    default: "rounded-lg border shadow-md",
    input: "rounded-lg border shadow-md",
    output: "rounded-lg border shadow-md",
    "start-end": "rounded-full border-2 shadow-md aspect-square flex items-center justify-center text-center bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800",
    decision: "rotate-45 border-2 shadow-md flex items-center justify-center aspect-square bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800",
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
    const { updateNodeData, setNodes, getNode, getNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);
    const zoom = useStore((s) => s.transform[2]);
    const showDetails = zoom >= 0.55;

    const isDecision = type === "decision";
    const shapeClass = shapeStyles[type as string] || shapeStyles.default;
    const categoryClass = data.category && type !== "start-end" && type !== "decision"
        ? categoryStyles[data.category as keyof typeof categoryStyles] || ""
        : "";

    // Calculate node state bounds
    const isCompleted = data.isCompleted || data.quizPassed;
    const allNodes = getNodes();
    const activeNode = allNodes
        .sort((a, b) => (a.data.stepNumber as number || 999) - (b.data.stepNumber as number || 999))
        .find(n => !n.data.isCompleted && !n.data.quizPassed && n.type !== "start-end" && n.type !== "decision");
    const isActive = activeNode?.id === id;
    const isFuture = !isCompleted && !isActive && !data.isStartNode && type !== "start-end" && type !== "decision";

    const completedClass = isCompleted
        ? "!border-l-emerald-500 !bg-emerald-50 dark:!bg-emerald-900/30 ring-1 ring-emerald-500/30"
        : "";
    const activeClass = isActive ? "ring-[3px] ring-primary ring-offset-2 shadow-xl !border-primary" : "";
    const futureClass = isFuture ? "opacity-[0.6] grayscale-[50%] hover:opacity-100 hover:grayscale-0" : "";

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
        ${activeClass}
        ${futureClass}
        ${selected && !isActive ? "ring-2 ring-primary" : ""}
        min-w-[320px] min-h-[120px] h-auto
        transition-all duration-300
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

            {/* Locked Badge (shown when node is a future dependent step) */}
            {isFuture && (
                <div
                    className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full text-muted-foreground bg-muted shadow-sm ring-1 ring-border tooltip-trigger"
                    title="Selesaikan tahap sebelumnya terlebih dahulu"
                >
                    <Lock className="h-3.5 w-3.5" />
                </div>
            )}
            <NodeResizer
                isVisible={selected}
                minWidth={50}
                minHeight={50}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-background rounded shadow-sm"
            />

            <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1 p-1 bg-background border border-border shadow-md rounded-lg mb-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded flex items-center justify-center transition-colors tooltip-trigger"
                    title="Edit Label"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setNodes((nodes) => nodes.filter(n => n.id !== id)); }}
                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded flex items-center justify-center transition-colors"
                    title="Delete Node"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
            </NodeToolbar>

            {/* Target (vertical connector enters from above) */}
            <Handle type="target" position={Position.Top} id="target-top"
                className="!bg-primary !border-primary-foreground !w-3 !h-3" />

            {/* Source (vertical connector exits downward) */}
            <Handle type="source" position={Position.Bottom} id="source-bottom"
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
                        <div className={`flex items-start justify-between gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] origin-top ${!showDetails ? "scale-[1.15] translate-y-[18px]" : "scale-100 translate-y-0"}`}>
                            <div className={`font-semibold select-none flex items-start gap-2 w-full transition-all duration-500 ${!showDetails ? "justify-center" : "justify-start"}`}>
                                {data.stepNumber && (
                                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold shrink-0 mt-0.5 transition-colors ${data.isCompleted || data.quizPassed
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
                                <span className={`text-base break-words leading-tight transition-all duration-500 ${!showDetails ? "text-center" : "text-left"}`}>{data.label}</span>
                            </div>
                            {data.estimatedTime && !isDecision && type !== "start-end" && (
                                <span className={`text-[11px] text-muted-foreground/60 whitespace-nowrap shrink-0 mt-1 transition-opacity duration-300 ${showDetails ? "opacity-100" : "opacity-0 invisible"}`}>
                                    ⏱ {data.estimatedTime as string}
                                </span>
                            )}
                        </div>
                        {/* Row 2: Short description */}
                        {data.description && !isDecision && type !== "start-end" && (
                            <div className={`text-sm text-muted-foreground/80 mt-1 line-clamp-1 select-none pointer-events-none transition-opacity duration-300 ${showDetails ? "opacity-100" : "opacity-0 invisible"}`}>
                                {data.description}
                            </div>
                        )}
                        {/* Row 3: Phase badge */}
                        {data.phase && !isDecision && type !== "start-end" && (
                            <div className={`mt-2 transition-opacity duration-300 ${showDetails ? "opacity-100" : "opacity-0 invisible"}`}>
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
