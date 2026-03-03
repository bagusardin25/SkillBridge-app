import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import {
    X,
    ExternalLink,
    Sparkles,
    CheckCircle2,
    Circle,
    Heart,
    Globe,
    BookOpen,
    Video,
    Rss,
    GraduationCap,
    Lock,
    Clock,
    ArrowRight
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { QuizFullScreen } from "@/components/quiz/QuizFullScreen";
import { NodeChatPanel } from "@/components/chat/NodeChatPanel";

const categoryLabels: Record<string, { label: string; color: string }> = {
    core: { label: "Core", color: "bg-primary text-primary-foreground" },
    optional: { label: "Optional", color: "bg-slate-500 text-white" },
    advanced: { label: "Advanced", color: "bg-violet-500 text-white" },
    project: { label: "Project", color: "bg-emerald-500 text-white" },
};

// Detect resource type from URL
function getResourceType(url: string): { type: string; color: string; icon: typeof Globe } {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("roadmap.sh")) {
        return { type: "Roadmap", color: "bg-violet-600 text-white", icon: Globe };
    }
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("video")) {
        return { type: "Video", color: "bg-rose-500 text-white", icon: Video };
    }
    if (lowerUrl.includes("reddit") || lowerUrl.includes("feed") || lowerUrl.includes("forum") || lowerUrl.includes("community")) {
        return { type: "Feed", color: "bg-orange-500 text-white", icon: Rss };
    }
    return { type: "Article", color: "bg-slate-700 text-white", icon: BookOpen };
}

// Extract readable name from URL
function getResourceName(url: string): string {
    try {
        const urlObj = new URL(url);
        let name = urlObj.pathname.split("/").filter(Boolean).pop() || urlObj.hostname;
        name = name.replace(/[-_]/g, " ").replace(/\.(html|htm|php|aspx)$/i, "");
        return name.split(" ").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ") || urlObj.hostname;
    } catch {
        return url;
    }
}

export function NodeDetailPanel() {
    const { nodes, edges, selectedNodeIds, closeDetailPanel, currentRoadmapId } = useRoadmapStore();
    const { updateNodeData } = useReactFlow();
    const [activeTab, setActiveTab] = useState("resources");
    const [showQuiz, setShowQuiz] = useState(false);

    // Reset tab to resources when node changes
    useEffect(() => {
        setActiveTab("resources");
    }, [selectedNodeIds]);

    const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));
    const data = selectedNode?.data as RoadmapNodeData | undefined;

    // Find prerequisite nodes (nodes that point to this node)
    const prerequisiteNodes = selectedNode
        ? edges
            .filter(e => e.target === selectedNode.id)
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is typeof nodes[0] => n !== undefined)
        : [];

    // Check if all prerequisites are completed (either quizPassed or isCompleted)
    const incompletePrerequisites = prerequisiteNodes.filter(
        n => {
            const nodeData = n.data as RoadmapNodeData;
            // Node dianggap selesai jika quizPassed ATAU isCompleted
            return !(nodeData?.quizPassed || nodeData?.isCompleted);
        }
    );
    const allPrerequisitesPassed = incompletePrerequisites.length === 0;

    // Handle quiz completion
    const handleQuizComplete = () => {
        if (selectedNode) {
            updateNodeData(selectedNode.id, {
                quizPassed: true,
                isCompleted: true,
                status: "done"
            });
        }
        setShowQuiz(false);
    };

    // Handle resource click - track visited resources
    const handleResourceClick = (resource: string) => {
        if (!selectedNode || !data) return;
        const currentVisited = data.visitedResources || [];
        if (!currentVisited.includes(resource)) {
            updateNodeData(selectedNode.id, {
                visitedResources: [...currentVisited, resource]
            });
        }
    };

    if (!selectedNode || !data) {
        return (
            <div className="flex flex-col h-full border-l bg-background w-full md:w-80">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Node Details</h2>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeDetailPanel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Select a node to view its details
                    </p>
                </div>
            </div>
        );
    }

    const category = categoryLabels[data.category || ""] || null;
    const isCompleted = data.quizPassed || data.isCompleted;

    // Kalkulasi progress dihapus sesuai instruksi
    // Dummy estimated time based on category if not provided
    const estimatedTime = data.estimatedTime || (data.category === 'project' ? '4-8 Jam' : data.category === 'core' ? '2-3 Jam' : '1 Jam');

    return (
        <div className="flex flex-col h-full bg-background w-full">
            {/* Panel Header - Similar to ChatPanel */}
            <div className="p-3 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center border border-violet-200 dark:border-violet-800">
                            <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold leading-none">Node Details</h2>
                        <span className="text-[10px] text-muted-foreground">Resources & AI Tutor</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeDetailPanel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs Header */}
                <div className="px-3 pt-2 pb-0">
                    <div className="flex items-center justify-between gap-2">
                        <TabsList className="h-8 flex-1">
                            <TabsTrigger value="resources" className="text-xs px-2 gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                Resources
                            </TabsTrigger>
                            <TabsTrigger value="ai-tutor" className="text-xs px-2 gap-1">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Tutor
                            </TabsTrigger>
                        </TabsList>

                        {/* Status Badge (read-only) */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                            }`}>
                            {isCompleted ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                <Circle className="h-3.5 w-3.5" />
                            )}
                            {isCompleted ? "Done" : "Pending"}
                        </div>
                    </div>
                </div>

                {/* Resources Tab */}
                <TabsContent value="resources" className="flex-1 overflow-hidden m-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {/* Title & Category & Estimated Time */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-xl font-bold leading-tight">{data.label}</h3>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        {category && (
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${category.color} shadow-sm`}>
                                                {category.label}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">
                                            <Clock className="h-3 w-3" />
                                            <span>{estimatedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {data.description && (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {data.description}
                                    </p>

                                    {/* AI Tutor Shortcut */}
                                    <button
                                        onClick={() => setActiveTab("ai-tutor")}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent border border-violet-200/50 hover:border-violet-300 dark:border-violet-800/50 dark:hover:border-violet-700 hover:shadow-sm group transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">Bingung dengan materi ini?</p>
                                                <p className="text-[10px] text-violet-600/70 dark:text-violet-400/70">Tanya AI Tutor sekarang</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-violet-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </button>
                                </div>
                            )}



                            {/* Resources */}
                            {data.resources && data.resources.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-rose-500">
                                        <Heart className="h-4 w-4 fill-current" />
                                        <span className="text-sm font-medium">Free Resources</span>
                                    </div>
                                    <div className="border-t border-dashed border-rose-200 dark:border-rose-900" />

                                    <div className="space-y-2">
                                        {data.resources.map((resource, index) => {
                                            const isUrl = resource.startsWith("http");
                                            const resourceInfo = isUrl ? getResourceType(resource) : null;
                                            const ResourceIcon = resourceInfo?.icon || ExternalLink;
                                            const displayName = isUrl ? getResourceName(resource) : resource;
                                            const isVisited = data.visitedResources?.includes(resource);

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                                                    onClick={isUrl ? () => { handleResourceClick(resource); window.open(resource, "_blank"); } : undefined}
                                                >
                                                    {isUrl && (
                                                        <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                                    )}
                                                    {resourceInfo && (
                                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex-shrink-0 ${resourceInfo.color} shadow-sm group-hover:shadow transition-shadow`}>
                                                            {resourceInfo.type}
                                                        </span>
                                                    )}
                                                    {isUrl ? (
                                                        <a
                                                            href={resource}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => { e.stopPropagation(); handleResourceClick(resource); }}
                                                            className={`text-sm font-medium flex-1 flex items-center justify-between gap-2 transition-colors ${isVisited ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                                                                }`}
                                                        >
                                                            <span className="line-clamp-1">{displayName}</span>
                                                            {isVisited ? (
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                            ) : (
                                                                <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary flex-shrink-0" />
                                                            )}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm flex items-center gap-2">
                                                            <ResourceIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            {resource}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Video Tutorials */}
                            {data.videos && data.videos.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Video className="h-4 w-4" />
                                        <span className="text-sm font-medium">Video Tutorials</span>
                                    </div>
                                    <div className="border-t border-dashed border-red-200 dark:border-red-900" />

                                    <div className="space-y-2">
                                        {data.videos.map((video, index) => {
                                            const isVisited = data.visitedResources?.includes(video);
                                            const videoName = getResourceName(video);

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-red-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                                                    onClick={() => { handleResourceClick(video); window.open(video, "_blank"); }}
                                                >
                                                    <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex-shrink-0 bg-red-500 text-white shadow-sm group-hover:shadow transition-shadow">
                                                        Video
                                                    </span>
                                                    <a
                                                        href={video}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => { e.stopPropagation(); handleResourceClick(video); }}
                                                        className={`text-sm font-medium flex-1 flex items-center justify-between gap-2 transition-colors ${isVisited ? "text-muted-foreground" : "text-foreground group-hover:text-red-500"
                                                            }`}
                                                    >
                                                        <span className="line-clamp-1">{videoName}</span>
                                                        {isVisited ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                        ) : (
                                                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-red-500 flex-shrink-0" />
                                                        )}
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quiz Button - Only for core and advanced nodes */}
                            {(data.category === "core" || data.category === "advanced") && (
                                <div className="pt-4 border-t">
                                    {/* Warning if roadmap not saved */}
                                    {!currentRoadmapId && !isCompleted && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                ⚠️ Simpan roadmap terlebih dahulu (Ctrl+S) untuk mengerjakan quiz
                                            </p>
                                        </div>
                                    )}
                                    {isCompleted ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-emerald-700 dark:text-emerald-400">Quiz Completed!</p>
                                                <p className="text-sm text-emerald-600 dark:text-emerald-500">You've mastered this topic.</p>
                                            </div>
                                        </div>
                                    ) : !allPrerequisitesPassed ? (
                                        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                            <div className="flex items-start gap-3 relative z-10 mb-4">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 shadow-sm border border-amber-200 dark:border-amber-800">
                                                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-amber-800 dark:text-amber-300">Quiz Terkunci</p>
                                                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">Selesaikan prasyarat berikut untuk membuka Quiz</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 relative z-10 bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-amber-100/50 dark:border-amber-900/50">
                                                {incompletePrerequisites.map((node, i) => (
                                                    <div key={node.id} className="flex items-start gap-2.5">
                                                        <div className="h-5 w-5 rounded-full bg-amber-200/50 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{i + 1}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                                            {(node.data as RoadmapNodeData).label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => setShowQuiz(true)}
                                            className="w-full h-10 py-2 px-4 text-sm bg-primary hover:bg-primary/90 flex items-center justify-center"
                                        >
                                            <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span>Take Quiz to Complete This Topic</span>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Info for optional nodes */}
                            {data.category === "optional" && (
                                <div className="pt-4 border-t">
                                    {isCompleted ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-emerald-700 dark:text-emerald-400">Completed!</p>
                                                <p className="text-sm text-emerald-600 dark:text-emerald-500">You've explored this optional topic.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">
                                                    This is an optional topic. No quiz required - explore at your own pace!
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    if (selectedNode) {
                                                        updateNodeData(selectedNode.id, {
                                                            isCompleted: true,
                                                            status: "done"
                                                        });
                                                    }
                                                }}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Mark as Complete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Project section with completion functionality */}
                            {data.category === "project" && (
                                <div className="pt-4 border-t space-y-4">
                                    {isCompleted ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-emerald-700 dark:text-emerald-400">Project Completed!</p>
                                                <p className="text-sm text-emerald-600 dark:text-emerald-500">Great job finishing this project.</p>
                                            </div>
                                        </div>
                                    ) : !allPrerequisitesPassed ? (
                                        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                            <div className="flex items-start gap-3 relative z-10 mb-4">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 shadow-sm border border-amber-200 dark:border-amber-800">
                                                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-amber-800 dark:text-amber-300">Project Terkunci</p>
                                                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">Selesaikan prasyarat berikut untuk membuka Project</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 relative z-10 bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-amber-100/50 dark:border-amber-900/50">
                                                {incompletePrerequisites.map((node, i) => (
                                                    <div key={node.id} className="flex items-start gap-2.5">
                                                        <div className="h-5 w-5 rounded-full bg-amber-200/50 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{i + 1}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                                            {(node.data as RoadmapNodeData).label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                                                    🚀 Cara Menyelesaikan Project Ini:
                                                </h4>
                                                <ol className="text-sm text-emerald-600 dark:text-emerald-500 space-y-2 list-decimal list-inside">
                                                    <li>Pelajari semua resources yang tersedia di atas</li>
                                                    <li>Buat project sesuai dengan topik "{data.label}"</li>
                                                    <li>Implementasikan konsep yang sudah dipelajari</li>
                                                    <li>Setelah selesai, klik tombol di bawah untuk menandai selesai</li>
                                                </ol>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground">
                                                    💡 Tips: Gunakan AI Tutor jika butuh bantuan dalam mengerjakan project ini!
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    if (selectedNode) {
                                                        updateNodeData(selectedNode.id, {
                                                            isCompleted: true,
                                                            status: "done"
                                                        });
                                                    }
                                                }}
                                                className="w-full h-auto min-h-12 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 whitespace-normal leading-snug flex items-center justify-center text-center"
                                            >
                                                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                                                <span>Saya Sudah Menyelesaikan Project Ini</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* AI Tutor Tab */}
                <TabsContent value="ai-tutor" className="flex-1 overflow-hidden m-0">
                    <NodeChatPanel nodeId={selectedNode.id} topic={data.label} />
                </TabsContent>
            </Tabs>

            {/* Quiz Full Screen Overlay */}
            {showQuiz && selectedNode && (
                <QuizFullScreen
                    topic={data.label}
                    description={data.description}
                    nodeId={selectedNode.id}
                    onComplete={handleQuizComplete}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
}
