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
                    title="Mulai manual"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <LayoutTemplate className="h-6 w-6 text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold mb-1">Start Your Learning Journey</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Choose a template or ask AI to create a personalized roadmap.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
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
                            className="cursor-pointer hover:border-primary hover:scale-[1.02] hover:shadow-lg transition-all duration-200 text-left"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between">
                                    <span className="text-2xl">{template.icon}</span>
                                    <Badge 
                                        variant="secondary" 
                                        className={difficultyColors[template.difficulty]}
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
            <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">
                    Want something more personalized?
                </p>
                <Button onClick={onAskAi} size="default" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI to Create Custom Roadmap
                </Button>
            </div>
        </div>
    );
}
