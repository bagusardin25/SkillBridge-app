import { useMemo } from "react";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    MarkerType,
    useNodesState,
    useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomNode } from "@/components/nodes/CustomNode";
import { LabeledEdge } from "@/components/edges/LabeledEdge";
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";

const nodeTypes = {
    default: CustomNode,
    input: CustomNode,
    output: CustomNode,
    roadmapCard: CustomNode,
    decision: CustomNode,
    "start-end": CustomNode,
    project: CustomNode,
};

const edgeTypes = {
    labeled: LabeledEdge,
    default: LabeledEdge,
};

const defaultEdgeOptions = {
    type: "labeled",
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "hsl(var(--primary))",
    },
    style: {
        strokeWidth: 2,
        stroke: "hsl(var(--primary))",
    },
    animated: true,
};

// Sprawling Web Developer roadmap
const initialNodes: RoadmapNode[] = [
    {
        id: "internet",
        type: "default",
        position: { x: 800, y: 0 },
        data: {
            label: "Internet",
            description: "How the web works",
            resources: [],
            isCompleted: true,
            category: "core",
        },
    },
    {
        id: "html",
        type: "default",
        position: { x: 200, y: 200 },
        data: {
            label: "HTML",
            stepNumber: 1,
            description: "Structure",
            resources: [],
            isCompleted: true,
            category: "core",
        },
    },
    {
        id: "css",
        type: "default",
        position: { x: 800, y: 200 },
        data: {
            label: "CSS",
            stepNumber: 2,
            description: "Styling",
            resources: [],
            isCompleted: true,
            category: "core",
        },
    },
    {
        id: "js",
        type: "default",
        position: { x: 1400, y: 200 },
        data: {
            label: "JavaScript",
            stepNumber: 3,
            description: "Interactivity",
            resources: [],
            isCompleted: true, // Active node
            category: "core",
        },
    },
    {
        id: "tailwind",
        type: "default",
        position: { x: 400, y: 400 },
        data: {
            label: "Tailwind CSS",
            stepNumber: 4,
            description: "Utility-first CSS",
            resources: [],
            isCompleted: false,
            category: "optional",
        },
    },
    {
        id: "ts",
        type: "default",
        position: { x: 1100, y: 400 },
        data: {
            label: "TypeScript",
            stepNumber: 5,
            description: "Typed JS",
            resources: [],
            isCompleted: false,
            category: "core",
        },
    },
    {
        id: "react",
        type: "default",
        position: { x: 1700, y: 400 },
        data: {
            label: "React",
            stepNumber: 6,
            description: "UI Library",
            resources: [],
            isCompleted: false,
            category: "advanced",
        },
    },
    {
        id: "nextjs",
        type: "default",
        position: { x: 1700, y: 600 },
        data: {
            label: "Next.js",
            stepNumber: 7,
            description: "React Framework",
            resources: [],
            isCompleted: false,
            category: "advanced",
        },
    },
    {
        id: "project",
        type: "project",
        position: { x: 800, y: 700 },
        data: {
            label: "Fullstack App",
            description: "E-Commerce Project",
            resources: [],
            isCompleted: false,
            category: "project",
        },
    }
];

const initialEdges: RoadmapEdge[] = [
    { id: "e-int-html", source: "internet", target: "html", animated: false },
    { id: "e-int-css", source: "internet", target: "css", animated: false },
    { id: "e-int-js", source: "internet", target: "js", animated: false },
    { id: "e-css-tw", source: "css", target: "tailwind", animated: true },
    { id: "e-js-ts", source: "js", target: "ts", animated: true },
    { id: "e-js-react", source: "js", target: "react", animated: true },
    { id: "e-react-next", source: "react", target: "nextjs", animated: false },
    { id: "e-next-proj", source: "nextjs", target: "project", animated: false, type: "default", style: { strokeDasharray: "5 5" } },
    { id: "e-tw-proj", source: "tailwind", target: "project", animated: false, type: "default", style: { strokeDasharray: "5 5" } },
];


export function HeroRoadmapDemo() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    // Calculate dynamic edges similar to main canvas (simplified)
    const dynamicEdges = useMemo(() => {
        return edges.map(edge => {
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

            return {
                ...edge,
                data: {
                    ...edge.data,
                    pathStatus: status
                }
            };
        })
    }, [edges, nodes]);


    return (
        <div className="absolute inset-0 w-full h-[150%] -top-[15%] opacity-50 mix-blend-screen pointer-events-auto overflow-hidden">
            {/* Gradient Mask to fade out edges smoothly into the background */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.4) 40%, #050505 80%)'
                }}
            />

            <ReactFlow
                nodes={nodes}
                edges={dynamicEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={{ padding: 0.1, maxZoom: 1.0 }}
                nodesDraggable={true} // Allow dragging for interactvity
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={true}
                panOnScroll={false} // Disable scroll to not trap the page scroll
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                preventScrolling={false} // Allow underlying page to scroll naturally
                className="cursor-grab active:cursor-grabbing"
            >
                <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(255,255,255,0.15)" />
            </ReactFlow>
        </div>
    );
}
