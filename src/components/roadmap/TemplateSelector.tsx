import { useState } from "react";
import { roadmapTemplates, type RoadmapTemplate } from "@/data/roadmapTemplates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Sparkles, ChevronRight, LayoutTemplate, X } from "lucide-react";
import { useAppLanguage } from "@/contexts/LanguageContext";

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
    const { t } = useAppLanguage();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = [...new Set(roadmapTemplates.map(t => t.category))];

    const filteredTemplates = selectedCategory
        ? roadmapTemplates.filter(t => t.category === selectedCategory)
        : roadmapTemplates;

    return (
        <div className="relative mx-auto w-full max-w-2xl rounded-xl border border-border bg-background/95 p-3 text-center shadow-xl backdrop-blur-sm sm:p-4">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-3 sm:top-3"
                    title="Close"
                    aria-label="Close"
                    data-testid="template-selector-close"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center sm:mb-4 sm:h-16 sm:w-16">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                <div className="relative flex h-full w-full rotate-3 items-center justify-center rounded-2xl border bg-background shadow-sm transition-all hover:rotate-6">
                    <LayoutTemplate className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                </div>
            </div>
            
            <h3 className="mb-1 px-6 text-lg font-bold tracking-tight sm:mb-2 sm:text-xl">{t.templateSelector.startJourney}</h3>
            <p className="mx-auto mb-3 max-w-[95%] text-xs text-muted-foreground sm:mb-4 sm:max-w-[80%] sm:text-sm">
                {t.templateSelector.description}
            </p>
            {/* Primary action */}
            <Button
                onClick={onAskAi}
                className="mb-4 h-11 w-full max-w-sm rounded-full shadow-md shadow-primary/20 sm:mb-6"
                size="lg"
            >
                <Sparkles className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{t.ux.primaryActionGenerate}</span>
            </Button>

            {/* Category Filter — horizontal scroll on narrow screens */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:mb-6 sm:flex-wrap sm:justify-center sm:overflow-visible">
                <Button
                    variant={selectedCategory === null ? "default" : "secondary"}
                    size="sm"
                    className={`shrink-0 rounded-full px-4 ${selectedCategory === null ? "shadow-md shadow-primary/20" : "bg-muted/50 hover:bg-primary/10 hover:text-primary"}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    {t.templateSelector.all}
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "secondary"}
                        size="sm"
                        className={`shrink-0 rounded-full px-4 ${selectedCategory === cat ? "shadow-md shadow-primary/20" : "bg-muted/50 hover:bg-primary/10 hover:text-primary"}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Templates Grid */}
            <ScrollArea className="mb-3 h-[min(40vh,220px)] sm:h-[240px]">
                <div className="grid grid-cols-1 gap-2 p-1 sm:grid-cols-2">
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
                                        {template.roadmap.nodes.length} {t.templateSelector.topics}
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
                    <span className="relative z-10 text-white font-medium">{t.templateSelector.askAi}</span>
                </Button>
            </div>
        </div>
    );
}
