import { memo } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
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
    animated,
}: EdgeProps) {
    const edgeData = data as LabeledEdgeData | undefined;
    const label = edgeData?.label;
    const edgeType = edgeData?.edgeType || "main";

    const [edgePath, labelX, labelY] = getBezierPath({
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
            strokeWidth: 2.5,
            filter: "drop-shadow(0 1px 2px rgba(99, 102, 241, 0.15))",
        },
        branch: {
            stroke: "hsl(var(--muted-foreground))",
            strokeWidth: 1.5,
            strokeDasharray: "6,4",
            className: "edge-animated",
        },
        optional: {
            stroke: "#94a3b8",
            strokeWidth: 1.5,
            strokeDasharray: "4,3",
            className: "edge-animated",
        },
    };

    const currentStyle = edgeStyles[edgeType] || edgeStyles.main;
    // Base styles
    const resolvedStyle: React.CSSProperties = {
        ...style,
        stroke: currentStyle.stroke,
        strokeWidth: currentStyle.strokeWidth,
        ...('strokeDasharray' in currentStyle ? { strokeDasharray: currentStyle.strokeDasharray as string } : {}),
        ...('filter' in currentStyle ? { filter: currentStyle.filter as string } : {}),
    };

    let edgeClass = ('className' in currentStyle ? currentStyle.className : "") as string;
    if (animated) {
        edgeClass += " react-flow__edge-path animate-pulse glow-edge";
        resolvedStyle.strokeWidth = 3;
        resolvedStyle.filter = "drop-shadow(0 0 6px hsl(var(--primary))) drop-shadow(0 0 12px hsl(var(--primary)))";
    }

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={resolvedStyle}
                className={edgeClass.trim()}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "none", // Allow clicking through label
                        }}
                        className="px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary/80 uppercase drop-shadow-sm select-none"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const LabeledEdge = memo(LabeledEdgeComponent);
