import { Square, Diamond, Circle, LayoutTemplate } from "lucide-react";
import type { DragEvent } from "react";

const nodeTypes = [
    { type: "default", label: "Default Node", icon: Square },
    { type: "decision", label: "Decision", icon: Diamond },
    { type: "circle", label: "Circle", icon: Circle },
    { type: "roadmapCard", label: "Roadmap Card", icon: LayoutTemplate },
];

export function NodePalette() {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Nodes</h2>
                <p className="text-sm text-muted-foreground">
                    Drag nodes to the canvas
                </p>
            </div>

            <div className="space-y-2">
                {nodeTypes.map(({ type, label, icon: Icon }) => (
                    <div
                        key={type}
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <div className="p-2 rounded-md bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
