import { create } from "zustand";
import { temporal } from "zundo";
import {
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
} from "@xyflow/react";
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";

type InteractionMode = "select" | "pan";

interface RoadmapStore {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    selectedNodeIds: string[];
    interactionMode: InteractionMode;
    isEditMode: boolean;
    isAiPanelOpen: boolean;
    isDetailPanelOpen: boolean;
    isSidebarOpen: boolean;
    isDarkMode: boolean;
    currentProjectId: string | null;
    currentProjectTitle: string;
    currentRoadmapId: string | null;
    contextualChatTopic: string | null;
    onProjectCreated: ((projectId: string) => void) | null;
    placingNodeType: string | null;
    onNodesChange: (changes: NodeChange<RoadmapNode>[]) => void;
    onEdgesChange: (changes: EdgeChange<RoadmapEdge>[]) => void;
    setNodes: (nodes: RoadmapNode[]) => void;
    setEdges: (edges: RoadmapEdge[]) => void;
    setProjectTitle: (title: string) => void;
    setCurrentProject: (id: string | null, title: string) => void;
    setCurrentRoadmapId: (id: string | null) => void;
    clearRoadmap: () => void;
    addNode: (node: RoadmapNode) => void;
    deleteSelectedNodes: () => void;
    duplicateSelectedNodes: () => void;
    setSelectedNodeIds: (ids: string[]) => void;
    setInteractionMode: (mode: InteractionMode) => void;
    toggleEditMode: () => void;
    toggleAiPanel: () => void;
    toggleDetailPanel: () => void;
    openDetailPanel: () => void;
    closeDetailPanel: () => void;
    toggleSidebar: () => void;
    toggleTheme: () => void;
    saveToLocalStorage: () => void;
    setContextualChatTopic: (topic: string | null) => void;
    askAiAboutTopic: (topic: string) => void;
    setOnProjectCreated: (callback: ((projectId: string) => void) | null) => void;
    setPlacingNodeType: (type: string | null) => void;
}

export const useRoadmapStore = create<RoadmapStore>()(
    temporal(
        (set, get) => ({
            nodes: [],
            edges: [],
            selectedNodeIds: [],
            interactionMode: "select" as InteractionMode,
            isEditMode: true,
            isAiPanelOpen: true,
            isDetailPanelOpen: false,
            isSidebarOpen: true,
            contextualChatTopic: null,
            isDarkMode: typeof window !== 'undefined' 
                ? localStorage.getItem('theme') !== 'light' 
                : true,
            currentProjectId: null,
            currentProjectTitle: '',
            currentRoadmapId: null,
            onProjectCreated: null,
            placingNodeType: null,

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },

            setNodes: (nodes) => {
                set({ nodes });
            },

            setEdges: (edges) => {
                set({ edges });
            },
            
            setProjectTitle: (title) => {
                set({ currentProjectTitle: title });
            },

            setCurrentProject: (id, title) => {
                set({ currentProjectId: id, currentProjectTitle: title });
                if (id) {
                    localStorage.setItem('currentProjectId', id);
                    localStorage.setItem('currentProjectTitle', title);
                } else {
                    localStorage.removeItem('currentProjectId');
                    localStorage.removeItem('currentProjectTitle');
                }
            },

            setCurrentRoadmapId: (id) => {
                set({ currentRoadmapId: id });
                if (id) {
                    localStorage.setItem('currentRoadmapId', id);
                } else {
                    localStorage.removeItem('currentRoadmapId');
                }
            },

            clearRoadmap: () => {
                set({ nodes: [], edges: [], currentRoadmapId: null });
                localStorage.removeItem('currentRoadmapId');
            },

            addNode: (node) => {
                set({ nodes: [...get().nodes, node] });
            },

            deleteSelectedNodes: () => {
                const { nodes, edges, selectedNodeIds } = get();
                const newNodes = nodes.filter((n) => !selectedNodeIds.includes(n.id));
                const newEdges = edges.filter(
                    (e) =>
                        !selectedNodeIds.includes(e.source) &&
                        !selectedNodeIds.includes(e.target)
                );
                set({ nodes: newNodes, edges: newEdges, selectedNodeIds: [] });
            },

            duplicateSelectedNodes: () => {
                const { nodes, selectedNodeIds, addNode } = get();
                const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
                selectedNodes.forEach((node) => {
                    const newNode: RoadmapNode = {
                        ...node,
                        id: `${node.id}_copy_${Date.now()}`,
                        position: { x: node.position.x + 50, y: node.position.y + 50 },
                        selected: false,
                    };
                    addNode(newNode);
                });
            },

            setSelectedNodeIds: (ids) => {
                set({ selectedNodeIds: ids });
            },

            setInteractionMode: (mode) => {
                set({ interactionMode: mode });
            },

            toggleEditMode: () => {
                set({ isEditMode: !get().isEditMode });
            },

            toggleAiPanel: () => {
                set({ isAiPanelOpen: !get().isAiPanelOpen });
            },

            toggleDetailPanel: () => {
                set({ isDetailPanelOpen: !get().isDetailPanelOpen });
            },

            openDetailPanel: () => {
                set({ isDetailPanelOpen: true });
            },

            closeDetailPanel: () => {
                set({ isDetailPanelOpen: false });
            },

            setContextualChatTopic: (topic) => {
                set({ contextualChatTopic: topic });
            },

            askAiAboutTopic: (topic) => {
                set({ 
                    contextualChatTopic: topic,
                    isDetailPanelOpen: false,
                    isAiPanelOpen: true,
                });
            },

            toggleSidebar: () => {
                set({ isSidebarOpen: !get().isSidebarOpen });
            },

            toggleTheme: () => {
                const newDarkMode = !get().isDarkMode;
                set({ isDarkMode: newDarkMode });
                localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
                if (newDarkMode) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            },

            saveToLocalStorage: () => {
                const { nodes, edges } = get();
                localStorage.setItem("roadmap-nodes", JSON.stringify(nodes));
                localStorage.setItem("roadmap-edges", JSON.stringify(edges));
                console.log("Saved!");
            },

            setOnProjectCreated: (callback) => {
                set({ onProjectCreated: callback });
            },

            setPlacingNodeType: (type) => {
                set({ placingNodeType: type });
            },
        }),
        {
            limit: 50,
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
            }),
            // Equality check to avoid tracking micro-changes during drag
            equality: (pastState, currentState) => 
                JSON.stringify(pastState) === JSON.stringify(currentState),
        }
    )
);

// Export temporal actions for undo/redo
export const useTemporalStore = () => useRoadmapStore.temporal.getState();
