import { useState, useEffect, useCallback } from "react";
import { Save, MessageSquare, PanelRightClose, Sun, Moon, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { SaveProjectDialog } from "@/components/ui/SaveProjectDialog";
import { createProject, createRoadmap, updateRoadmap } from "@/lib/api";

export function Header() {
    const {
        isAiPanelOpen,
        toggleAiPanel,
        isDarkMode,
        toggleTheme,
        currentProjectTitle,
        currentProjectId,
        currentRoadmapId,
        nodes,
        edges,
        setCurrentProject,
        setCurrentRoadmapId,
        onProjectCreated,
    } = useRoadmapStore();
    
    const { user } = useAuthStore();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Calculate progress - count both isCompleted and quizPassed nodes
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.data?.isCompleted || n.data?.quizPassed).length;
    const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    // Handle save - create new project if none exists, otherwise update
    const handleSave = useCallback(async () => {
        if (nodes.length === 0) {
            toast.error("Tidak ada roadmap untuk disimpan");
            return;
        }

        // Jika belum ada project, tampilkan dialog
        if (!currentProjectId) {
            setShowSaveDialog(true);
            return;
        }

        // Jika sudah ada project dan roadmap, update saja
        if (currentRoadmapId) {
            setIsSaving(true);
            try {
                await updateRoadmap(currentRoadmapId, { nodes, edges });
                toast.success("Roadmap berhasil disimpan!");
            } catch (error) {
                toast.error("Gagal menyimpan roadmap");
                console.error(error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [nodes, edges, currentProjectId, currentRoadmapId]);

    // Handle save new project from dialog
    const handleSaveNewProject = async (title: string) => {
        if (!user?.id) {
            toast.error("Silakan login terlebih dahulu");
            return;
        }

        try {
            // Create new project
            const project = await createProject(title, user.id);
            
            // Set as current project
            setCurrentProject(project.id, project.title);
            
            // Create roadmap for the project with current nodes/edges
            const roadmap = await createRoadmap(project.id, {
                title,
                nodes,
                edges,
            });
            
            // Set roadmap ID
            setCurrentRoadmapId(roadmap.id);
            
            // Notify sidebar to refresh
            if (onProjectCreated) {
                onProjectCreated(project.id);
            }
            
            toast.success(`Project "${title}" berhasil dibuat!`);
        } catch (error) {
            toast.error("Gagal membuat project");
            console.error(error);
            throw error;
        }
    };

    // Keyboard shortcut for Ctrl+S
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                handleSave();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    const handleExport = () => {
        // Mock export for now
        toast.info("Exporting project as image...", {
            description: "This feature will be available soon."
        });
    };

    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                {/* Project Title / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground hidden sm:inline-block">SkillBridge</span>
                    <span className="text-muted-foreground hidden sm:inline-block">/</span>
                    <span className="font-bold text-foreground">{currentProjectTitle}</span>
                </div>

                {/* Progress Stats */}
                {totalNodes > 0 && (
                    <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l">
                        <div className="flex items-center gap-2">
                            <Progress value={progressPercentage} className="w-24 h-2" />
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {completedNodes}/{totalNodes}
                            </span>
                        </div>
                        <span className={`text-xs font-bold ${progressPercentage === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                            {progressPercentage}%
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Switch Theme</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Export Button */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={handleExport} className="hidden sm:flex">
                                <Share2 className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export or Share</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                 {/* Save Button */}
                 <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSave}
                                disabled={isSaving || nodes.length === 0}
                             >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save Project (Ctrl+S)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* AI Panel Toggle */}
                <Button
                    variant={isAiPanelOpen ? "secondary" : "default"} // Changed "outline" to "default" to highlight
                    size="sm"
                    onClick={toggleAiPanel}
                    className={!isAiPanelOpen ? "shadow-sm" : ""}
                >
                    {isAiPanelOpen ? (
                        <PanelRightClose className="h-4 w-4 mr-2" />
                    ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    AI
                </Button>
            </div>

            {/* Save Project Dialog */}
            <SaveProjectDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                defaultTitle={currentProjectTitle || "My Roadmap"}
                onSave={handleSaveNewProject}
            />
        </header>
    );
}
