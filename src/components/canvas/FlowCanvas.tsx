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
    Panel,
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
        isDarkMode,
    } = useRoadmapStore();

    const [showMiniMap, setShowMiniMap] = useState(false);
    const { undo, redo } = useTemporalStore();
    const { screenToFlowPosition, setCenter, fitView } = useReactFlow();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleFocusCurrentStep = useCallback(() => {
        if (!nodes.length) return;

        // Try to find the first non-completed core step
        const currentNodes = nodes.filter(n => !(n.data.isCompleted || n.data.quizPassed));

        // Prioritize by stepNumber if available, otherwise just use the first available node
        const targetNode = [...currentNodes].sort((a, b) =>
            ((a.data.stepNumber as number) || 999) - ((b.data.stepNumber as number) || 999)
        )[0];

        if (targetNode) {
            const x = targetNode.position.x + (targetNode.width || 320) / 2;
            const y = targetNode.position.y + (targetNode.height || 120) / 2;
            setCenter(x, y, { zoom: 1.2, duration: 800 });
        } else {
            fitView({ duration: 800 });
        }
    }, [nodes, setCenter, fitView]);

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

    // Animate edges connecting completed nodes to in-progress nodes
    useEffect(() => {
        if (!nodes.length || !edges.length) return;

        let hasChanges = false;
        const newEdges = edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (sourceNode && targetNode) {
                const sourceCompleted = sourceNode.data.isCompleted || sourceNode.data.quizPassed;
                const targetCompleted = targetNode.data.isCompleted || targetNode.data.quizPassed;

                // Animate if source is completed but target is not, 
                // OR if it's the start node and it hasn't been completed yet.
                const isStartNotCompleted = sourceNode.data.isStartNode && !sourceCompleted;
                const shouldAnimate = !!((sourceCompleted && !targetCompleted) || isStartNotCompleted);

                if (edge.animated !== shouldAnimate) {
                    hasChanges = true;
                    return { ...edge, animated: shouldAnimate };
                }
            }
            return edge;
        });

        if (hasChanges) {
            setStoreEdges(newEdges);
        }
    }, [nodes, edges, setStoreEdges]);

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
        default: { width: 320, height: 120 },
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
                translateExtent={[[-2000, -1000], [3000, 10000]]}
                className={`bg-background ${placingNodeType ? "cursor-crosshair" : interactionMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls className="bg-background border-border" />
                <Panel position="top-center" className="mt-4">
                    <button
                        onClick={handleFocusCurrentStep}
                        className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 group"
                        title="Locate Current Step"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse">
                            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" />
                        </svg>
                        Focus Current Step
                    </button>
                </Panel>
                <Panel position="bottom-right" className="mb-4 mr-4 hidden sm:block">
                    <button
                        onClick={() => setShowMiniMap(!showMiniMap)}
                        className="px-3 py-1.5 bg-card/80 backdrop-blur border border-border text-foreground font-medium rounded-full shadow-sm hover:bg-muted transition-all text-xs flex items-center gap-2"
                        title="Toggle Minimap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" /></svg>
                        {showMiniMap ? "Hide Map" : "Map"}
                    </button>
                </Panel>
                {nodes.length > 0 && showMiniMap && (
                    <MiniMap
                        position="bottom-right"
                        className="!bg-card !border !border-border rounded-lg shadow-lg !m-4 !mb-16 hidden sm:block"
                        maskColor={isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.5)"}
                        zoomable
                        pannable
                        nodeStrokeWidth={3}
                        nodeColor={(node) => {
                            const data = node.data as { isCompleted?: boolean; quizPassed?: boolean } | undefined;
                            const isCompleted = data?.isCompleted || data?.quizPassed;

                            if (isCompleted) return "#10b981"; // emerald-500 for completed

                            switch (node.type) {
                                case "decision": return isDarkMode ? "#d97706" : "#f59e0b"; // amber
                                case "start-end": return isDarkMode ? "#4f46e5" : "#6366f1"; // indigo
                                case "project": return isDarkMode ? "#7c3aed" : "#8b5cf6"; // violet
                                case "image": return isDarkMode ? "#0891b2" : "#06b6d4"; // cyan
                                default: return isDarkMode ? "#4f46e5" : "#6366f1"; // indigo
                            }
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
}

