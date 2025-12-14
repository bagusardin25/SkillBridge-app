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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useRoadmapStore, useTemporalStore } from "@/store/useRoadmapStore";
import type { RoadmapNode } from "@/types/roadmap";
import { CustomNode } from "@/components/nodes/CustomNode";
import { ImageNode } from "@/components/nodes/ImageNode";
import { LabeledEdge } from "@/components/edges/LabeledEdge";
import { TemplateSelector } from "@/components/roadmap/TemplateSelector";
import { updateRoadmap } from "@/lib/api";
import { convertToReactFlowNodes } from "@/lib/layoutUtils";
import type { RoadmapTemplate } from "@/data/roadmapTemplates";

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

const edgeTypes = {
    labeled: LabeledEdge,
    default: LabeledEdge,
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
        placingNodeType,
        setPlacingNodeType,
        setNodes,
        setEdges: setStoreEdges,
    } = useRoadmapStore();

    const { undo, redo } = useTemporalStore();
    const { screenToFlowPosition } = useReactFlow();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);
    const [hideTemplateSelector, setHideTemplateSelector] = useState(false);

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
        type: 'labeled',
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

    // Track node positions before drag for undo
    const nodesBeforeDrag = useRef<RoadmapNode[] | null>(null);

    const onNodeDragStart = useCallback(() => {
        // Save current state before drag starts
        nodesBeforeDrag.current = JSON.parse(JSON.stringify(nodes));
    }, [nodes]);

    const onNodeDragStop = useCallback(() => {
        // After drag completes, clear the reference
        // The state has already been updated by onNodesChange
        // zundo will now capture this as a single change
        nodesBeforeDrag.current = null;
    }, []);

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    // Default sizes for different node types
    const defaultNodeSizes = useMemo(() => ({
        default: { width: 200, height: 70 },
        decision: { width: 110, height: 110 },
        "start-end": { width: 90, height: 90 },
        image: { width: 150, height: 150 },
    } as Record<string, { width: number; height: number }>), []);

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            const type = event.dataTransfer.getData("application/reactflow");
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const size = defaultNodeSizes[type] || { width: 180, height: 60 };

            const newNode: RoadmapNode = {
                id: getId(),
                type: type,
                position,
                width: size.width,
                height: size.height,
                style: { width: size.width, height: size.height },
                data: {
                    label: type === "decision" ? "Yes/No?" : `New ${type} Node`,
                    description: "",
                    resources: [],
                },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode, defaultNodeSizes]
    );

    const handleOpenAi = () => {
        if (!isAiPanelOpen) {
            toggleAiPanel();
        }
    };

    // Handle template selection
    const handleSelectTemplate = useCallback((template: RoadmapTemplate) => {
        const { nodes: newNodes, edges: newEdges } = convertToReactFlowNodes({
            title: template.roadmap.title,
            nodes: template.roadmap.nodes.map(n => ({
                ...n,
                data: {
                    description: n.data.description,
                    resources: n.data.resources,
                }
            })),
            edges: template.roadmap.edges,
        });
        setNodes(newNodes);
        setStoreEdges(newEdges);
    }, [setNodes, setStoreEdges]);

    // Handle click on canvas pane for placement mode (Figma style)
    const onPaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (!placingNodeType) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const size = defaultNodeSizes[placingNodeType] || { width: 180, height: 60 };

            const newNode: RoadmapNode = {
                id: getId(),
                type: placingNodeType,
                position: {
                    x: position.x - size.width / 2,
                    y: position.y - size.height / 2,
                },
                width: size.width,
                height: size.height,
                style: { width: size.width, height: size.height },
                data: {
                    label: placingNodeType === "decision" ? "Yes/No?" : placingNodeType === "start-end" ? "Start" : "New Topic",
                    description: "",
                    resources: [],
                },
            };

            addNode(newNode);
            setPlacingNodeType(null); // Exit placement mode after placing
        },
        [placingNodeType, screenToFlowPosition, addNode, setPlacingNodeType, defaultNodeSizes]
    );

    // Handle ESC to cancel placement mode
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && placingNodeType) {
                setPlacingNodeType(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [placingNodeType, setPlacingNodeType]);

    return (
        <div className="w-full h-full relative">
            {nodes.length === 0 && !hideTemplateSelector && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <TemplateSelector
                            onSelectTemplate={handleSelectTemplate}
                            onAskAi={handleOpenAi}
                            onClose={() => setHideTemplateSelector(true)}
                        />
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
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onPaneClick={onPaneClick}
                nodesDraggable={isEditMode}
                nodesConnectable={isEditMode}
                elementsSelectable={isEditMode}
                panOnDrag={interactionMode === "pan" && !placingNodeType}
                selectionOnDrag={interactionMode === "select" && !placingNodeType}
                panOnScroll={true}
                zoomOnScroll={false}
                zoomOnPinch={true}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={["Delete", "Backspace"]}
                snapToGrid={isEditMode}
                snapGrid={[20, 20]}
                fitView
                className={`bg-background ${placingNodeType ? "cursor-crosshair" : interactionMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls className="bg-background border-border" />
                {nodes.length > 0 && (
                    <MiniMap
                        position="bottom-right"
                        className="!bg-card !border !border-border rounded-lg shadow-lg m-4"
                        maskColor="rgba(0, 0, 0, 0.3)"
                        zoomable
                        pannable
                        nodeStrokeWidth={3}
                        nodeColor={(node) => {
                            const data = node.data as { isCompleted?: boolean; quizPassed?: boolean } | undefined;
                            const isCompleted = data?.isCompleted || data?.quizPassed;
                            
                            if (isCompleted) return "#10b981"; // emerald-500 for completed
                            
                            switch (node.type) {
                                case "decision": return "#f59e0b"; // amber-500
                                case "start-end": return "#6366f1"; // indigo-500
                                case "project": return "#8b5cf6"; // violet-500
                                case "image": return "#06b6d4"; // cyan-500
                                default: return "#6366f1"; // indigo-500
                            }
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
}

