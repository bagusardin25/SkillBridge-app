import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";

type CustomNodeProps = NodeProps<Node<RoadmapNodeData>>;

function CustomNodeComponent({ data, selected }: CustomNodeProps) {
    return (
        <div
            className={`
        px-4 py-3 rounded-lg border shadow-md min-w-[150px]
        bg-card text-card-foreground border-border
        ${selected ? "ring-2 ring-primary" : ""}
        transition-all duration-200
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-primary !border-primary-foreground !w-3 !h-3"
            />
            <div className="font-medium text-sm">{data.label}</div>
            {data.description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {data.description}
                </div>
            )}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-primary !border-primary-foreground !w-3 !h-3"
            />
        </div>
    );
}

export const CustomNode = memo(CustomNodeComponent);
