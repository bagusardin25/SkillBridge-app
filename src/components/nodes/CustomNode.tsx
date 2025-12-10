import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node, NodeResizer, useReactFlow } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle } from "lucide-react";

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

// Category-based styling for roadmap.sh style
const categoryStyles = {
    core: "border-l-4 border-l-primary bg-card",
    optional: "border-l-4 border-l-slate-400 bg-slate-50 dark:bg-slate-900/50",
    advanced: "border-l-4 border-l-violet-500 bg-violet-50 dark:bg-violet-900/20",
    project: "border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
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
    const completedClass = data.isCompleted 
        ? "!border-l-emerald-500 !bg-emerald-50 dark:!bg-emerald-900/30 ring-1 ring-emerald-500/30" 
        : "";

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { isCompleted: !data.isCompleted });
    };

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
        px-4 py-3 text-card-foreground border-border
        ${shapeClass}
        ${categoryClass}
        ${completedClass}
        ${selected ? "ring-2 ring-primary" : ""}
        h-full w-full
        transition-all duration-200
        relative group
      `}
            onDoubleClick={handleDoubleClick}
        >
            {/* Completed Toggle Button */}
            <button
                onClick={handleToggleComplete}
                className={`
                    absolute -top-2 -right-2 z-10
                    p-0.5 rounded-full
                    transition-all duration-200
                    ${data.isCompleted 
                        ? "text-emerald-500 bg-white dark:bg-gray-900 shadow-sm" 
                        : "text-muted-foreground/50 hover:text-muted-foreground bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 shadow-sm"
                    }
                `}
                title={data.isCompleted ? "Mark as not learned" : "Mark as learned"}
            >
                {data.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <Circle className="h-5 w-5" />
                )}
            </button>
            <NodeResizer
                isVisible={selected}
                minWidth={50}
                minHeight={50}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-background rounded shadow-sm"
            />
            <Handle
                type="target"
                position={Position.Top}
                className={`!bg-primary !border-primary-foreground !w-3 !h-3 ${isDecision ? "-rotate-45 !-top-3" : ""}`}
            />

            {/* Content rotation for decision nodes to keep text straight */}
            <div className={`flex flex-col items-center justify-center h-full w-full ${isDecision ? "-rotate-45" : ""}`}>
                {isEditing ? (
                     <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-xs text-center min-w-[100px]"
                     />
                ) : (
                    <>
                        <div className="font-medium text-sm text-center select-none w-full break-words whitespace-pre-wrap">
                            {data.label}
                        </div>
                        {data.description && !isDecision && type !== "start-end" && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 select-none pointer-events-none text-center">
                                {data.description}
                            </div>
                        )}
                    </>
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

export const CustomNode = memo(CustomNodeComponent);
