import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useReactFlow,
    type Connection,
    type OnSelectionChangeParams,
    BackgroundVariant,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { DragEvent } from "react";
import { useRoadmapStore, useTemporalStore } from "@/store/useRoadmapStore";
import type { RoadmapNode } from "@/types/roadmap";
import { CustomNode } from "@/components/nodes/CustomNode";
import { ImageNode } from "@/components/nodes/ImageNode";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { updateRoadmap } from "@/lib/api";

const nodeTypes = {
    default: CustomNode,
    input: CustomNode,
    output: CustomNode,
    roadmapCard: CustomNode,
    decision: CustomNode,
    "start-end": CustomNode,
    project: CustomNode,
    image: ImageNode,
};

let id = 100;
const getId = () => `node_${id++}`;

const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce

export function FlowCanvas() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        setEdges,
        addNode,
        isEditMode,
        interactionMode,
        setSelectedNodeIds,
        toggleAiPanel,
        isAiPanelOpen,
        currentRoadmapId,
        openDetailPanel,
    } = useRoadmapStore();

    const { undo, redo } = useTemporalStore();
    const { screenToFlowPosition } = useReactFlow();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    // Auto-save roadmap when nodes or edges change
    useEffect(() => {
        // Skip initial mount and when no roadmap is loaded
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (!currentRoadmapId || nodes.length === 0) return;

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounced save
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateRoadmap(currentRoadmapId, { nodes, edges });
                console.log("Roadmap auto-saved");
            } catch (error) {
                console.error("Failed to auto-save roadmap:", error);
            }
        }, AUTO_SAVE_DELAY);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [nodes, edges, currentRoadmapId]);

    const defaultEdgeOptions = useMemo(() => ({
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'hsl(var(--primary))',
        },
        style: {
            strokeWidth: 2,
            stroke: 'hsl(var(--primary))',
        },
        animated: true,
    }), []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "z") {
                event.preventDefault();
                undo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "y") {
                event.preventDefault();
                redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges(addEdge(connection, edges));
        },
        [edges, setEdges]
    );

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
            setSelectedNodeIds(selectedNodes.map((n) => n.id));
            // Open detail panel when a single node is selected
            if (selectedNodes.length === 1) {
                openDetailPanel();
            }
        },
        [setSelectedNodeIds, openDetailPanel]
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            const type = event.dataTransfer.getData("application/reactflow");
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: RoadmapNode = {
                id: getId(),
                type: type,
                position,
                data: {
                    label: `New ${type} Node`,
                    description: "",
                    resources: [],
                },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const handleOpenAi = () => {
        if (!isAiPanelOpen) {
            toggleAiPanel();
        }
    };

    return (
        <div className="w-full h-full relative">
            {nodes.length === 0 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm border border-border p-8 rounded-xl shadow-xl max-w-md text-center pointer-events-auto">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Start Your Roadmap</h3>
                        <p className="text-muted-foreground mb-6">
                            Your canvas is empty. Ask our AI Assistant to generate a learning path or drag nodes to build manually.
                        </p>
                        <Button onClick={handleOpenAi} size="lg" className="w-full">
                            Ask AI Assistant
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
            
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={isEditMode ? onConnect : undefined}
                onSelectionChange={onSelectionChange}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodesDraggable={isEditMode}
                nodesConnectable={isEditMode}
                elementsSelectable={isEditMode}
                panOnDrag={interactionMode === "pan"}
                selectionOnDrag={interactionMode === "select"}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={["Delete", "Backspace"]}
                fitView
                className="bg-background"
            >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls className="bg-background border-border" />
                <MiniMap
                    position="bottom-right"
                    className="!bg-card !border !border-border rounded-lg shadow-lg m-4"
                    maskColor="rgba(0, 0, 0, 0.3)"
                    zoomable
                    pannable
                    nodeColor={(node) => {
                        switch (node.type) {
                            case "decision": return "#f59e0b"; // amber-500
                            case "start-end": return "#10b981"; // emerald-500
                            case "project": return "#8b5cf6"; // violet-500
                            case "image": return "#06b6d4"; // cyan-500
                            default: return "#6366f1"; // indigo-500
                        }
                    }}
                />
            </ReactFlow>
        </div>
    );
}

