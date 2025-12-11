import {
    Undo2,
    Redo2,
    Trash2,
    Copy,
    MoreVertical,
    MousePointer2,
    Hand,
    Image,
    Square,
    Diamond,
    Circle,
    ZoomIn,
    ZoomOut,
    Maximize,
} from "lucide-react";
import type { DragEvent } from "react";
import { useRoadmapStore, useTemporalStore } from "@/store/useRoadmapStore";
import type { RoadmapNode } from "@/types/roadmap";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReactFlow } from "@xyflow/react";

let nodeIdCounter = 100;
const getNodeId = () => `node_${nodeIdCounter++}`;

export function BottomToolbar() {
    const {
        interactionMode,
        setInteractionMode,
        deleteSelectedNodes,
        duplicateSelectedNodes,
        selectedNodeIds,
        setNodes,
        setEdges,
        placingNodeType,
        setPlacingNodeType,
        addNode
    } = useRoadmapStore();

    const { undo, redo } = useTemporalStore();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    // Handle drag start for shape items (still support drag)
    const onDragStart = (event: DragEvent<HTMLButtonElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    // Handle single click - toggle placement mode (Figma style)
    const handleNodeToolClick = (nodeType: string) => {
        if (placingNodeType === nodeType) {
            // Clicking same tool again cancels placement mode
            setPlacingNodeType(null);
        } else {
            // Activate placement mode for this node type
            setPlacingNodeType(nodeType);
        }
    };

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

    const handleClearCanvas = () => {
        if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
            setNodes([]);
            setEdges([]);
        }
    };

    const actionButtonClass = (isDisabled = false) =>
        `flex items-center justify-center w-8 h-8 rounded-md transition-all ${isDisabled
            ? "text-muted-foreground opacity-50 cursor-not-allowed"
            : "hover:bg-muted text-foreground cursor-pointer active:scale-90"
        }`;

    const toolButtonClass = (isActive = false) =>
        `flex items-center justify-center w-10 h-10 rounded-lg transition-all ${isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-foreground cursor-pointer active:scale-90"
        }`;

    return (
        <TooltipProvider delayDuration={0}>
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 animate-in slide-in-from-bottom-4 duration-500">
                {/* Undo/Redo Bar - di atas main toolbar */}
                <div className="flex items-center gap-1 p-1.5 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border/50 rounded-lg shadow-sm">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button onClick={() => undo()} className={actionButtonClass()}>
                                <Undo2 className="h-4 w-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button onClick={() => redo()} className={actionButtonClass()}>
                                <Redo2 className="h-4 w-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/50 mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={deleteSelectedNodes}
                                disabled={selectedNodeIds.length === 0}
                                className={actionButtonClass(selectedNodeIds.length === 0)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete (Del)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={duplicateSelectedNodes}
                                disabled={selectedNodeIds.length === 0}
                                className={actionButtonClass(selectedNodeIds.length === 0)}
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/50 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={actionButtonClass()}>
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top">
                            <DropdownMenuItem onClick={() => zoomIn()}>
                                <ZoomIn className="mr-2 h-4 w-4" />
                                Zoom In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => zoomOut()}>
                                <ZoomOut className="mr-2 h-4 w-4" />
                                Zoom Out
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fitView()}>
                                <Maximize className="mr-2 h-4 w-4" />
                                Fit View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleClearCanvas} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Canvas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Main Tools Bar */}
                <div className="flex items-center gap-1 p-1.5 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border/50 rounded-xl shadow-xl">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setInteractionMode("select")}
                                className={toolButtonClass(interactionMode === "select")}
                            >
                                <MousePointer2 className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Select Tool</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setInteractionMode("pan")}
                                className={toolButtonClass(interactionMode === "pan")}
                            >
                                <Hand className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Hand Tool</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-6 bg-border/50 mx-1" />

                    {/* Implemented Tools */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleAddImage}
                                className={toolButtonClass()}
                            >
                                <Image className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Add Image</TooltipContent>
                    </Tooltip>


                    <div className="w-px h-6 bg-border/50 mx-1" />

                    {/* Shape Nodes - Click to activate placement mode, then click on canvas */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => handleNodeToolClick("default")}
                                draggable
                                onDragStart={(e) => onDragStart(e, "default")}
                                className={toolButtonClass(placingNodeType === "default")}
                            >
                                <Square className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Topic Node - Click then place on canvas</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => handleNodeToolClick("decision")}
                                draggable
                                onDragStart={(e) => onDragStart(e, "decision")}
                                className={toolButtonClass(placingNodeType === "decision")}
                            >
                                <Diamond className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Decision Node - Click then place on canvas</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => handleNodeToolClick("start-end")}
                                draggable
                                onDragStart={(e) => onDragStart(e, "start-end")}
                                className={toolButtonClass(placingNodeType === "start-end")}
                            >
                                <Circle className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Start/End Node - Click then place on canvas</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
