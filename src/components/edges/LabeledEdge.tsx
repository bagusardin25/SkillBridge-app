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
    pathStatus?: "completed" | "active" | "locked";
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
    const pathStatus = edgeData?.pathStatus || "completed"; // Default to completed if unspecified

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const resolvedStyle: React.CSSProperties = { ...style, transition: "all 0.5s ease" };
    let edgeClass = "transition-all duration-500 ease-in-out ";

    if (pathStatus === "completed") {
        resolvedStyle.stroke = "hsl(var(--primary))";
        resolvedStyle.strokeWidth = 3.5;
        // Subtle drop shadow matching primary color
        resolvedStyle.filter = "drop-shadow(0 0 2px rgba(99, 102, 241, 0.4))";
    } else if (pathStatus === "active") {
        resolvedStyle.stroke = "hsl(var(--primary))";
        resolvedStyle.strokeWidth = 3;
        edgeClass += " react-flow__edge-path active-path glow-edge-subtle";
    } else if (pathStatus === "locked") {
        resolvedStyle.stroke = "hsl(var(--muted-foreground))";
        resolvedStyle.strokeWidth = 1.5;
        resolvedStyle.opacity = 0.4;
        resolvedStyle.strokeDasharray = "5,5";
        edgeClass += " react-flow__edge-path";
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
