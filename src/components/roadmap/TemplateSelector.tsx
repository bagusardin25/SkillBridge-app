import { useState } from "react";
import { roadmapTemplates, type RoadmapTemplate } from "@/data/roadmapTemplates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Sparkles, ChevronRight, LayoutTemplate, X } from "lucide-react";

interface TemplateSelectorProps {
    onSelectTemplate: (template: RoadmapTemplate) => void;
    onAskAi: () => void;
    onClose?: () => void;
}

const difficultyColors = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export function TemplateSelector({ onSelectTemplate, onAskAi, onClose }: TemplateSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = [...new Set(roadmapTemplates.map(t => t.category))];

    const filteredTemplates = selectedCategory
        ? roadmapTemplates.filter(t => t.category === selectedCategory)
        : roadmapTemplates;

    return (
        <div className="relative bg-background/80 backdrop-blur-sm border border-border p-4 rounded-xl shadow-xl max-w-2xl text-center">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Close"
                    aria-label="Close"
                    data-testid="template-selector-close"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="relative h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-background border shadow-sm h-full w-full rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-all">
                    <LayoutTemplate className="h-7 w-7 text-primary" />
                </div>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight mb-2">Start Your Learning Journey</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[80%] mx-auto">
                Choose a curated template or ask AI to construct a highly personalized roadmap just for you.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Button
                    variant={selectedCategory === null ? "default" : "secondary"}
                    size="sm"
                    className={`rounded-full px-4 ${selectedCategory === null ? "shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary bg-muted/50"}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "secondary"}
                        size="sm"
                        className={`rounded-full px-4 ${selectedCategory === cat ? "shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary bg-muted/50"}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Templates Grid */}
            <ScrollArea className="h-[200px] mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
                    {filteredTemplates.map(template => (
                        <Card
                            key={template.id}
                            className="cursor-pointer group hover:border-primary/50 border-transparent bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden relative"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <CardHeader className="p-4 pb-2 relative z-10">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                        {template.icon}
                                    </div>
                                    <Badge 
                                        variant="secondary" 
                                        className={`rounded-full font-medium px-2.5 py-0.5 border ${difficultyColors[template.difficulty]}`}
                                    >
                                        {template.difficulty}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base">{template.title}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {template.estimatedTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {template.roadmap.nodes.length} topics
                                        <ChevronRight className="h-3 w-3" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            {/* AI Alternative */}
            <div className="border-t pt-4 mt-2">
                <Button 
                    onClick={onAskAi} 
                    size="default" 
                    className="w-full relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-zinc-800 dark:to-zinc-900 group-hover:opacity-90 transition-opacity" />
                    <Sparkles className="mr-2 h-4 w-4 relative z-10 text-white animate-pulse" />
                    <span className="relative z-10 text-white font-medium">Ask AI to Create Custom Roadmap</span>
                </Button>
            </div>
        </div>
    );
}
