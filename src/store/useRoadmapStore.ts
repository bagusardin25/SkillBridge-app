import { create } from "zustand";
import { temporal } from "zundo";
import {
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
} from "@xyflow/react";
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";

// Dummy data matching the RoadmapResponse schema
const initialNodes: RoadmapNode[] = [
    {
        id: "1",
        type: "input",
        position: { x: 250, y: 0 },
        data: {
            label: "Learn Programming",
            description: "Start your journey into software development",
            resources: ["https://freecodecamp.org", "https://codecademy.com"],
        },
    },
    {
        id: "2",
        type: "default",
        position: { x: 100, y: 100 },
        data: {
            label: "HTML & CSS",
            description: "Learn the building blocks of the web",
            resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML"],
        },
    },
    {
        id: "3",
        type: "default",
        position: { x: 400, y: 100 },
        data: {
            label: "JavaScript",
            description: "Add interactivity to your websites",
            resources: ["https://javascript.info"],
        },
    },
    {
        id: "4",
        type: "default",
        position: { x: 250, y: 200 },
        data: {
            label: "React",
            description: "Build modern user interfaces",
            resources: ["https://react.dev"],
        },
    },
    {
        id: "5",
        type: "output",
        position: { x: 250, y: 300 },
        data: {
            label: "Build Projects",
            description: "Apply your knowledge by building real-world projects",
            resources: ["https://github.com"],
        },
    },
];

const initialEdges: RoadmapEdge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" },
    { id: "e2-4", source: "2", target: "4" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
];

type InteractionMode = "select" | "pan";

interface RoadmapStore {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    selectedNodeIds: string[];
    interactionMode: InteractionMode;
    isEditMode: boolean;
    isAiPanelOpen: boolean;
    isSidebarOpen: boolean;
    isDarkMode: boolean;
    currentProjectTitle: string; // Add this
    onNodesChange: (changes: NodeChange<RoadmapNode>[]) => void;
    onEdgesChange: (changes: EdgeChange<RoadmapEdge>[]) => void;
    setNodes: (nodes: RoadmapNode[]) => void;
    setEdges: (edges: RoadmapEdge[]) => void;
    setProjectTitle: (title: string) => void; // Add this
    addNode: (node: RoadmapNode) => void;
    deleteSelectedNodes: () => void;
    duplicateSelectedNodes: () => void;
    setSelectedNodeIds: (ids: string[]) => void;
    setInteractionMode: (mode: InteractionMode) => void;
    toggleEditMode: () => void;
    toggleAiPanel: () => void;
    toggleSidebar: () => void;
    toggleTheme: () => void;
    saveToLocalStorage: () => void;
}

export const useRoadmapStore = create<RoadmapStore>()(
    temporal(
        (set, get) => ({
            nodes: initialNodes,
            edges: initialEdges,
            selectedNodeIds: [],
            interactionMode: "select" as InteractionMode,
            isEditMode: true,
            isAiPanelOpen: true,
            isSidebarOpen: true,
            isDarkMode: true,
            currentProjectTitle: "Learn React", // Default value

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

            toggleSidebar: () => {
                set({ isSidebarOpen: !get().isSidebarOpen });
            },

            toggleTheme: () => {
                const newDarkMode = !get().isDarkMode;
                set({ isDarkMode: newDarkMode });
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
        }),
        {
            limit: 50,
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
            }),
        }
    )
);

// Export temporal actions for undo/redo
export const useTemporalStore = () => useRoadmapStore.temporal.getState();
