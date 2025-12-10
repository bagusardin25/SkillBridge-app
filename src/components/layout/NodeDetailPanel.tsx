import { useState } from "react";
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
    MessageSquare,
    GraduationCap,
    Lock
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import type { RoadmapNodeData } from "@/types/roadmap";
import { QuizFullScreen } from "@/components/quiz/QuizFullScreen";

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
    const { nodes, edges, selectedNodeIds, closeDetailPanel, askAiAboutTopic } = useRoadmapStore();
    const { updateNodeData } = useReactFlow();
    const [showQuiz, setShowQuiz] = useState(false);

    const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));
    const data = selectedNode?.data as RoadmapNodeData | undefined;

    // Find prerequisite nodes (nodes that point to this node)
    const prerequisiteNodes = selectedNode 
        ? edges
            .filter(e => e.target === selectedNode.id)
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is typeof nodes[0] => n !== undefined)
        : [];
    
    // Check if all prerequisites are completed
    const incompletePrerequisites = prerequisiteNodes.filter(
        n => !(n.data as RoadmapNodeData)?.quizPassed
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

    if (!selectedNode || !data) {
        return (
            <div className="flex flex-col h-full border-l bg-background w-80">
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

    return (
        <div className="flex flex-col h-full border-l bg-background w-96 shadow-xl">
            <Tabs defaultValue="resources" className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Tabs and Status Badge */}
                <div className="p-3 border-b bg-muted/10">
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
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            isCompleted 
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

                        {/* Close Button */}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeDetailPanel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Resources Tab */}
                <TabsContent value="resources" className="flex-1 overflow-hidden m-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {/* Title & Category */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-xl font-bold leading-tight">{data.label}</h3>
                                    {category && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${category.color}`}>
                                            {category.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {data.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {data.description}
                                </p>
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

                                            return (
                                                <div key={index} className="flex items-start gap-2">
                                                    {resourceInfo && (
                                                        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${resourceInfo.color}`}>
                                                            {resourceInfo.type}
                                                        </span>
                                                    )}
                                                    {isUrl ? (
                                                        <a
                                                            href={resource}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            {displayName}
                                                            <ExternalLink className="h-3 w-3 opacity-50" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm flex items-center gap-1">
                                                            <ResourceIcon className="h-3.5 w-3.5" />
                                                            {resource}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quiz Button - Large and Prominent */}
                            <div className="pt-4 border-t">
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
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lock className="h-5 w-5 text-amber-600" />
                                            <p className="font-medium text-amber-700 dark:text-amber-400">Quiz Locked</p>
                                        </div>
                                        <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
                                            Complete these topics first:
                                        </p>
                                        <ul className="space-y-1">
                                            {incompletePrerequisites.map(node => (
                                                <li key={node.id} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                                    <Circle className="h-3 w-3" />
                                                    {(node.data as RoadmapNodeData).label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={() => setShowQuiz(true)}
                                        className="w-full h-14 text-base bg-primary hover:bg-primary/90"
                                        size="lg"
                                    >
                                        <GraduationCap className="h-5 w-5 mr-2" />
                                        Take Quiz to Complete This Topic
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* AI Tutor Tab */}
                <TabsContent value="ai-tutor" className="flex-1 overflow-hidden m-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Ask AI about {data.label}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Get personalized explanations and guidance from AI.
                                </p>
                            </div>

                            {/* Quick Questions */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
                                <div className="space-y-2">
                                    {[
                                        `What is ${data.label} and why is it important?`,
                                        `How do I get started with ${data.label}?`,
                                        `What are common mistakes when learning ${data.label}?`,
                                        `What should I learn after ${data.label}?`
                                    ].map((question, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-left h-auto py-2 text-xs"
                                            onClick={() => askAiAboutTopic(question)}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                            <span className="line-clamp-2">{question}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Ask Button */}
                            <Button
                                onClick={() => askAiAboutTopic(data.label)}
                                className="w-full"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Ask anything about this topic
                            </Button>
                        </div>
                    </ScrollArea>
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
