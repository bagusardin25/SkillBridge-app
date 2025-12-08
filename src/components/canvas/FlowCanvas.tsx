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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";
import type { DragEvent } from "react";
import { useRoadmapStore, useTemporalStore } from "@/store/useRoadmapStore";
import type { RoadmapNode } from "@/types/roadmap";
import { CustomNode } from "@/components/nodes/CustomNode";
import { ImageNode } from "@/components/nodes/ImageNode";

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
    } = useRoadmapStore();

    const { undo, redo } = useTemporalStore();
    const { screenToFlowPosition } = useReactFlow();

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
        },
        [setSelectedNodeIds]
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

    return (
        <div className="w-full h-full">
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
                deleteKeyCode={["Delete", "Backspace"]}
                fitView
                className="bg-background"
            >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls className="bg-background border-border" />
                <MiniMap
                    className="bg-background border-border"
                    nodeColor="#6366f1"
                    maskColor="rgba(0, 0, 0, 0.8)"
                />
            </ReactFlow>
        </div>
    );
}
