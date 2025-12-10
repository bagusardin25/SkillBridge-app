import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import {
    X,
    ExternalLink,
    Sparkles,
    ChevronDown,
    Circle,
    CheckCircle2,
    Timer,
    XCircle,
    Heart,
    Globe,
    BookOpen,
    Video,
    Rss,
    MessageSquare
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import type { RoadmapNodeData, NodeStatus } from "@/types/roadmap";

const categoryLabels: Record<string, { label: string; color: string }> = {
    core: { label: "Core", color: "bg-primary text-primary-foreground" },
    optional: { label: "Optional", color: "bg-slate-500 text-white" },
    advanced: { label: "Advanced", color: "bg-violet-500 text-white" },
    project: { label: "Project", color: "bg-emerald-500 text-white" },
};

const statusConfig: Record<NodeStatus, { label: string; icon: typeof Circle; color: string; shortcut: string }> = {
    pending: { label: "Pending", icon: Circle, color: "text-muted-foreground", shortcut: "" },
    done: { label: "Done", icon: CheckCircle2, color: "text-emerald-500", shortcut: "D" },
    "in-progress": { label: "In Progress", icon: Timer, color: "text-amber-500", shortcut: "L" },
    skipped: { label: "Skip", icon: XCircle, color: "text-slate-400", shortcut: "S" },
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
    // Default to Article
    return { type: "Article", color: "bg-slate-700 text-white", icon: BookOpen };
}

// Extract readable name from URL
function getResourceName(url: string): string {
    try {
        const urlObj = new URL(url);
        // Get pathname and clean it up
        let name = urlObj.pathname.split("/").filter(Boolean).pop() || urlObj.hostname;
        // Replace dashes/underscores with spaces and capitalize
        name = name.replace(/[-_]/g, " ").replace(/\.(html|htm|php|aspx)$/i, "");
        // Capitalize first letter of each word
        return name.split(" ").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ") || urlObj.hostname;
    } catch {
        return url;
    }
}

export function NodeDetailPanel() {
    const { nodes, selectedNodeIds, closeDetailPanel, askAiAboutTopic } = useRoadmapStore();
    const { updateNodeData } = useReactFlow();

    const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));
    const data = selectedNode?.data as RoadmapNodeData | undefined;
    const currentStatus: NodeStatus = data?.status || "pending";

    // Handle status change
    const handleStatusChange = useCallback((newStatus: NodeStatus) => {
        if (selectedNode) {
            updateNodeData(selectedNode.id, {
                status: newStatus,
                isCompleted: newStatus === "done"
            });
        }
    }, [selectedNode, updateNodeData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedNode) return;

            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case "d":
                    handleStatusChange("done");
                    break;
                case "l":
                    handleStatusChange("in-progress");
                    break;
                case "s":
                    handleStatusChange("skipped");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedNode, handleStatusChange]);

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
    const StatusIcon = statusConfig[currentStatus].icon;

    return (
        <div className="flex flex-col h-full border-l bg-background w-96 shadow-xl">
            <Tabs defaultValue="resources" className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Tabs and Status */}
                <div className="p-3 border-b bg-muted/10">
                    <div className="flex items-center justify-between gap-2">
                        <TabsList className="h-8 flex-1">
                            <TabsTrigger value="resources" className="text-xs px-3 gap-1.5">
                                <Heart className="h-3.5 w-3.5" />
                                Resources
                            </TabsTrigger>
                            <TabsTrigger value="ai-tutor" className="text-xs px-3 gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Tutor
                            </TabsTrigger>
                        </TabsList>

                        {/* Status Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                    <StatusIcon className={`h-3.5 w-3.5 ${statusConfig[currentStatus].color}`} />
                                    {statusConfig[currentStatus].label}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {Object.entries(statusConfig).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            onClick={() => handleStatusChange(key as NodeStatus)}
                                            className="gap-2"
                                        >
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                            {config.label}
                                            {config.shortcut && (
                                                <DropdownMenuShortcut>{config.shortcut}</DropdownMenuShortcut>
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

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

            {/* Footer with keyboard hints */}
            <div className="p-2 border-t bg-muted/10">
                <p className="text-xs text-muted-foreground text-center">
                    Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">D</kbd> Done ·
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono ml-1">L</kbd> In Progress ·
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono ml-1">S</kbd> Skip
                </p>
            </div>
        </div>
    );
}
