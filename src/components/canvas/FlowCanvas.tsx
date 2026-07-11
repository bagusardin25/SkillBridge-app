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
import { PathListView } from "@/components/roadmap/PathListView";
import { NextStepChip } from "@/components/roadmap/NextStepChip";
import { updateRoadmap } from "@/lib/api";
import { convertToReactFlowNodes } from "@/lib/layoutUtils";
import type { RoadmapTemplate } from "@/data/roadmapTemplates";
import { getNextRecommendedNode } from "@/lib/learningUtils";
import { useAppLanguage } from "@/contexts/LanguageContext";

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
        selectedNodeIds,
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
        viewMode,
        showExploreTemplates,
        setShowExploreTemplates,
        setSelectedNodeIds: storeSetSelected,
        openDetailPanel: storeOpenDetail,
        toggleAiPanel: storeToggleAi,
        isAiPanelOpen: storeAiOpen,
        toggleViewMode,
        toggleFocusMode,
        setSaveStatus,
        closeDetailPanel,
    } = useRoadmapStore();

    const { t } = useAppLanguage();
    const [showMiniMap, setShowMiniMap] = useState(false);
    const [showCoachMark, setShowCoachMark] = useState(() => {
        try {
            return localStorage.getItem("skillbridge_coach_node") !== "1";
        } catch {
            return false;
        }
    });
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

        // Debounced save with status indicator (5.3 trust)
        setSaveStatus("saving");
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateRoadmap(currentRoadmapId, { nodes, edges });
                setSaveStatus("saved", new Date());
            } catch (error) {
                console.error("Failed to auto-save roadmap:", error);
                setSaveStatus("error");
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

    // Keyboard shortcuts (5.3): undo/redo + N next, Q quiz panel, C chat, F focus, L list
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing =
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable);

            if ((event.ctrlKey || event.metaKey) && event.key === "z") {
                event.preventDefault();
                undo();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "y") {
                event.preventDefault();
                redo();
                return;
            }

            if (typing || event.ctrlKey || event.metaKey || event.altKey) return;

            const key = event.key.toLowerCase();
            if (key === "l") {
                event.preventDefault();
                toggleViewMode();
            } else if (key === "f") {
                event.preventDefault();
                toggleFocusMode();
            } else if (key === "c") {
                event.preventDefault();
                if (!storeAiOpen) storeToggleAi();
                closeDetailPanel();
            } else if (key === "n") {
                event.preventDefault();
                const next = getNextRecommendedNode(nodes, edges);
                if (next) {
                    storeSetSelected([next.id]);
                    storeOpenDetail();
                    const x = next.position.x + 160;
                    const y = next.position.y + 60;
                    setCenter(x, y, { zoom: 1.2, duration: 600 });
                }
            } else if (key === "q") {
                event.preventDefault();
                const next = getNextRecommendedNode(nodes, edges);
                if (next) {
                    storeSetSelected([next.id]);
                    storeOpenDetail();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        undo,
        redo,
        toggleViewMode,
        toggleFocusMode,
        storeAiOpen,
        storeToggleAi,
        closeDetailPanel,
        nodes,
        edges,
        storeSetSelected,
        storeOpenDetail,
        setCenter,
    ]);

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
        setHideTemplateSelector(true);
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
                    videos: n.data.videos,
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
    // Calculate global progress (include all learning nodes including the start node)
    const learningNodes = nodes.filter(n => n.type !== "start-end" && n.type !== "decision");
    const completedNodesCount = learningNodes.filter(n => n.data.isCompleted || n.data.quizPassed).length;
    const totalNodesCount = learningNodes.length;
    const progressPercentage = totalNodesCount > 0 ? Math.round((completedNodesCount / totalNodesCount) * 100) : 0;

    // Calculate dynamic edge statuses
    // Determine if selected node is locked (has incomplete prerequisites)
    const selectedNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;
    const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
    const isSelectedNodeLocked = selectedNode && !selectedNode.data.isCompleted && !selectedNode.data.quizPassed;

    const dynamicEdges = edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        const isSourceCompleted = sourceNode?.data.isCompleted || sourceNode?.data.quizPassed || sourceNode?.type === "start-end" || sourceNode?.data.isStartNode;
        const isTargetCompleted = targetNode?.data.isCompleted || targetNode?.data.quizPassed;

        let status = "locked";
        if (isSourceCompleted && isTargetCompleted) {
            status = "completed";
        } else if (isSourceCompleted && !isTargetCompleted) {
            status = "active";
        }

        // Highlight prerequisite edges: if target = selected locked node AND source is incomplete
        if (isSelectedNodeLocked && edge.target === selectedNodeId && !isSourceCompleted) {
            status = "prerequisite";
        }

        return {
            ...edge,
            data: {
                ...edge.data,
                pathStatus: status
            }
        };
    });

    const handleFocusNode = useCallback(
        (nodeId: string) => {
            const target = nodes.find((n) => n.id === nodeId);
            if (!target) return;
            const x = target.position.x + (target.width || 320) / 2;
            const y = target.position.y + (target.height || 120) / 2;
            setCenter(x, y, { zoom: 1.2, duration: 800 });
        },
        [nodes, setCenter]
    );

    const dismissCoach = () => {
        setShowCoachMark(false);
        try {
            localStorage.setItem("skillbridge_coach_node", "1");
        } catch { /* ignore */ }
    };

    // List view (mobile-first)
    if (viewMode === "list" && nodes.length > 0) {
        return (
            <div className="relative h-full w-full min-w-0 overflow-hidden">
                <PathListView />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3 safe-bottom">
                    <NextStepChip
                        className="max-w-full w-full sm:w-auto sm:max-w-[22rem]"
                        onFocusNode={handleFocusNode}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full min-w-0 overflow-hidden">
            {(nodes.length === 0 && !hideTemplateSelector) || showExploreTemplates ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-stretch justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
                    <div className="pointer-events-auto my-auto w-full max-w-2xl">
                        <TemplateSelector
                            onSelectTemplate={(tpl) => {
                                handleSelectTemplate(tpl);
                                setShowExploreTemplates(false);
                            }}
                            onAskAi={() => {
                                handleOpenAi();
                                setShowExploreTemplates(false);
                            }}
                            onClose={() => {
                                setHideTemplateSelector(true);
                                setShowExploreTemplates(false);
                            }}
                        />
                    </div>
                </div>
            ) : null}

            <ReactFlow
                nodes={nodes}
                edges={dynamicEdges}
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
                <Controls className="bg-background border-border" showInteractive={false} />
                <Panel position="top-center" className="mt-4 flex flex-col items-center gap-3" aria-label="Global progress indicator">
                    {totalNodesCount > 0 ? (
                        <div className="flex cursor-default items-center gap-4 rounded-full border border-border bg-card/90 px-4 py-2 shadow-md backdrop-blur animate-node-appear">
                            <span className="whitespace-nowrap text-xs font-semibold">
                                🚀 {completedNodesCount} / {totalNodesCount}
                            </span>
                            <div className="hidden h-2.5 w-32 overflow-hidden rounded-full bg-muted shadow-inner sm:block">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                    role="progressbar"
                                    aria-valuenow={progressPercentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                            <span className="min-w-[32px] text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {progressPercentage}%
                            </span>
                        </div>
                    ) : null}
                    {showCoachMark && nodes.length > 0 && (
                        <div className="max-w-xs rounded-xl border bg-background/95 px-3 py-2 text-center text-xs shadow-lg backdrop-blur">
                            <p className="text-muted-foreground">{t.ux.coachMarkNode}</p>
                            <button
                                type="button"
                                className="mt-1 text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
                                onClick={dismissCoach}
                            >
                                OK
                            </button>
                        </div>
                    )}
                </Panel>
                <Panel position="bottom-center" className="mb-2 flex w-[min(100vw-1.5rem,24rem)] flex-col items-center gap-2 sm:mb-4">
                    {nodes.length > 0 && (
                        <>
                            <NextStepChip
                                className="w-full max-w-full"
                                onFocusNode={handleFocusNode}
                            />
                            <button
                                onClick={handleFocusCurrentStep}
                                className="group hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
                                title="Locate Current Step"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse" aria-hidden>
                                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" />
                                </svg>
                                Focus Current Step
                            </button>
                            <p className="hidden text-[10px] text-muted-foreground lg:block">{t.ux.shortcutsHint}</p>
                        </>
                    )}
                </Panel>
                <Panel position="bottom-right" className="mb-4 mr-4 hidden sm:block">
                    <button
                        onClick={() => setShowMiniMap(!showMiniMap)}
                        className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title="Toggle Minimap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" /></svg>
                        {showMiniMap ? "Hide Map" : "Map"}
                    </button>
                </Panel>
                {nodes.length > 0 && showMiniMap && (
                    <MiniMap
                        position="bottom-right"
                        className="!m-4 !mb-16 hidden rounded-lg !border !border-border !bg-card shadow-lg sm:block"
                        maskColor={isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.5)"}
                        zoomable
                        pannable
                        nodeStrokeWidth={3}
                        nodeColor={(node) => {
                            const data = node.data as { isCompleted?: boolean; quizPassed?: boolean } | undefined;
                            const isCompleted = data?.isCompleted || data?.quizPassed;

                            if (isCompleted) return "#10b981";

                            switch (node.type) {
                                case "decision": return isDarkMode ? "#d97706" : "#f59e0b";
                                case "start-end": return isDarkMode ? "#4f46e5" : "#6366f1";
                                case "project": return isDarkMode ? "#7c3aed" : "#8b5cf6";
                                case "image": return isDarkMode ? "#0891b2" : "#06b6d4";
                                default: return isDarkMode ? "#4f46e5" : "#6366f1";
                            }
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
}

