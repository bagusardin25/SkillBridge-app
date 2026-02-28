import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/style.css";
import { getPublicRoadmap, type PublicRoadmap } from "@/lib/api";
import { ReadOnlyNode } from "@/components/nodes/ReadOnlyNode";

const nodeTypes = {
    default: ReadOnlyNode,
    input: ReadOnlyNode,
    output: ReadOnlyNode,
    roadmapCard: ReadOnlyNode,
    decision: ReadOnlyNode,
    "start-end": ReadOnlyNode,
    project: ReadOnlyNode,
};
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/Logo";
import {
    Loader2,
    Lock,
    AlertCircle,
    ArrowLeft,
    Share2,
    Eye,
} from "lucide-react";

export function SharePage() {
    const { roadmapId } = useParams<{ roadmapId: string }>();
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState<PublicRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!roadmapId) {
                setError("Invalid roadmap ID");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getPublicRoadmap(roadmapId);
                setRoadmap(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load roadmap");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoadmap();
    }, [roadmapId]);

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading roadmap...</p>
            </div>
        );
    }

    // Error state - Private roadmap
    if (error?.includes("private")) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                        <Lock className="h-8 w-8 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Roadmap is Private</h1>
                    <p className="text-muted-foreground">
                        This roadmap is not publicly shared. Ask the owner to make it public.
                    </p>
                    <Button onClick={() => navigate("/app")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go to SkillBridge
                    </Button>
                </div>
            </div>
        );
    }

    // Error state - Not found or other errors
    if (error || !roadmap) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold">Roadmap Not Found</h1>
                    <p className="text-muted-foreground">
                        {error || "The roadmap you're looking for doesn't exist or has been deleted."}
                    </p>
                    <Button onClick={() => navigate("/app")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go to SkillBridge
                    </Button>
                </div>
            </div>
        );
    }

    // Debug logging
    console.log("Roadmap data:", roadmap);
    console.log("Raw nodes:", roadmap.nodes);
    console.log("Raw edges:", roadmap.edges);

    const nodes = (roadmap.nodes as Node[]) || [];
    const edges = (roadmap.edges as Edge[]) || [];
    const authorName = roadmap.project.user.name || "Anonymous";

    console.log("Parsed nodes:", nodes);
    console.log("Parsed edges:", edges);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="h-14 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/app")}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Logo size={28} />
                        <span className="font-semibold text-lg hidden sm:inline">SkillBridge</span>
                    </button>
                    <div className="h-6 w-px bg-border hidden sm:block" />
                    <Badge variant="secondary" className="gap-1">
                        <Eye className="h-3 w-3" />
                        View Only
                    </Badge>
                </div>
                <Button onClick={() => navigate("/register")} size="sm">
                    Create Your Own Roadmap
                </Button>
            </header>

            {/* Roadmap Info */}
            <div className="border-b bg-muted/30 px-4 py-3">
                <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={roadmap.project.user.avatarUrl || ""} />
                            <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{roadmap.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                by {authorName} • {nodes.length} topics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            <Share2 className="h-3 w-3 mr-1" />
                            Public Roadmap
                        </Badge>
                    </div>
                </div>
            </div>

            {/* ReactFlow Canvas - needs explicit height */}
            <div className="flex-1 min-h-[500px] h-[calc(100vh-280px)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    panOnDrag={true}
                    zoomOnScroll={true}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    className="bg-background"
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                    <Controls className="bg-background border-border" showInteractive={false} />
                    <MiniMap
                        position="bottom-right"
                        className="!bg-card !border !border-border rounded-lg shadow-lg m-4"
                        maskColor="rgba(0, 0, 0, 0.3)"
                        zoomable
                        pannable
                    />
                </ReactFlow>
            </div>

            {/* Footer CTA */}
            <div className="border-t bg-muted/30 px-4 py-4">
                <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                        <p className="font-medium">Want to create your own learning roadmap?</p>
                        <p className="text-sm text-muted-foreground">
                            SkillBridge uses AI to generate personalized learning paths for you.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/register")} size="lg">
                        Get Started Free
                    </Button>
                </div>
            </div>
        </div>
    );
}
