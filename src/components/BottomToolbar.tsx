import {
    Square,
    Diamond,
    Circle,
    Hammer,
    Undo2,
    Redo2,
    MousePointer2,
    Hand,
    ImagePlus,
    Copy,
    Trash2,
    Minus,
    MoreHorizontal,
} from "lucide-react";
import type { DragEvent } from "react";
import { useRoadmapStore, useTemporalStore } from "@/store/useRoadmapStore";
import { Separator } from "@/components/ui/separator";
import type { RoadmapNode } from "@/types/roadmap";

// Shape items for drag and drop
const shapeItems = [
    { type: "default", label: "Topic Node", icon: Square },
    { type: "decision", label: "Decision Node", icon: Diamond },
    { type: "start-end", label: "Start/End", icon: Circle },
    { type: "project", label: "Project", icon: Hammer },
];

let nodeIdCounter = 100;
const getNodeId = () => `node_${nodeIdCounter++}`;

export function BottomToolbar() {
    const {
        interactionMode,
        setInteractionMode,
        addNode,
        deleteSelectedNodes,
        duplicateSelectedNodes,
        selectedNodeIds,
    } = useRoadmapStore();

    const { undo, redo } = useTemporalStore();

    // Handle drag start for shape items
    const onDragStart = (event: DragEvent<HTMLButtonElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    // Add image node to center
    const handleAddImage = () => {
        const imageUrl = prompt("Enter image URL:", "https://via.placeholder.com/150");
        if (imageUrl) {
            const newNode: RoadmapNode = {
                id: getNodeId(),
                type: "image",
                position: { x: 400, y: 200 },
                data: {
                    label: "Image",
                    description: "",
                    resources: [],
                    imageUrl,
                },
            };
            addNode(newNode);
        }
    };

    const buttonClass = (isActive = false) =>
        `flex items-center justify-center w-10 h-10 rounded-md transition-colors cursor-pointer ${isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-foreground"
        }`;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-xl shadow-2xl">
                {/* Group 1: Shapes (Drag & Drop) */}
                {shapeItems.map(({ type, label, icon: Icon }) => (
                    <button
                        key={type}
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        title={`Drag to add: ${label}`}
                        className={`${buttonClass()} cursor-grab active:cursor-grabbing`}
                    >
                        <Icon className="h-5 w-5" />
                    </button>
                ))}

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Group 2: History */}
                <button
                    onClick={() => undo()}
                    title="Undo (Ctrl+Z)"
                    className={buttonClass()}
                >
                    <Undo2 className="h-5 w-5" />
                </button>
                <button
                    onClick={() => redo()}
                    title="Redo (Ctrl+Y)"
                    className={buttonClass()}
                >
                    <Redo2 className="h-5 w-5" />
                </button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Group 3: Tools (Mode Switching) */}
                <button
                    onClick={() => setInteractionMode("select")}
                    title="Select Mode"
                    className={buttonClass(interactionMode === "select")}
                >
                    <MousePointer2 className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setInteractionMode("pan")}
                    title="Pan Mode"
                    className={buttonClass(interactionMode === "pan")}
                >
                    <Hand className="h-5 w-5" />
                </button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Group 4: Actions */}
                <button
                    onClick={handleAddImage}
                    title="Add Image Node"
                    className={buttonClass()}
                >
                    <ImagePlus className="h-5 w-5" />
                </button>
                <button
                    onClick={duplicateSelectedNodes}
                    title="Duplicate Selected"
                    disabled={selectedNodeIds.length === 0}
                    className={`${buttonClass()} ${selectedNodeIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    <Copy className="h-5 w-5" />
                </button>
                <button
                    onClick={deleteSelectedNodes}
                    title="Delete Selected"
                    disabled={selectedNodeIds.length === 0}
                    className={`${buttonClass()} ${selectedNodeIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    <Trash2 className="h-5 w-5" />
                </button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Edge Style */}
                <button title="Solid Line" className={buttonClass()}>
                    <Minus className="h-5 w-5" />
                </button>
                <button title="Dashed Line" className={buttonClass()}>
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
