import { memo } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type EdgeProps,
} from "@xyflow/react";

interface LabeledEdgeData {
    label?: string;
    edgeType?: "main" | "branch" | "optional";
}

function LabeledEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    style,
}: EdgeProps) {
    const edgeData = data as LabeledEdgeData | undefined;
    const label = edgeData?.label;
    const edgeType = edgeData?.edgeType || "main";

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const edgeStyles = {
        main: {
            stroke: "hsl(var(--primary))",
            strokeWidth: 2,
        },
        branch: {
            stroke: "hsl(var(--muted-foreground))",
            strokeWidth: 1.5,
            strokeDasharray: "5,5",
            className: "edge-animated",
        },
        optional: {
            stroke: "#94a3b8",
            strokeWidth: 1.5,
            strokeDasharray: "3,3",
            className: "edge-animated",
        },
    };

    const currentStyle = edgeStyles[edgeType] || edgeStyles.main;
    const { className: edgeClassName, ...styleProps } = currentStyle as typeof currentStyle & { className?: string };

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{ ...style, ...styleProps }}
                className={edgeClassName}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                        }}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-background border border-border shadow-sm text-muted-foreground"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const LabeledEdge = memo(LabeledEdgeComponent);
