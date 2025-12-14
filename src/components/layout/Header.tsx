import { useState, useEffect, useCallback } from "react";
import { Save, MessageSquare, PanelRightClose, Sun, Moon, Download, Loader2, Menu } from "lucide-react";
import { toPng } from "html-to-image";
import { getNodesBounds, useReactFlow } from "@xyflow/react";
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
import { CertificateModal } from "@/components/ui/CertificateModal";
import { ProgressDashboard } from "@/components/ui/ProgressDashboard";
import { ShareModal } from "@/components/ui/ShareModal";
import { createProject, createRoadmap, updateRoadmap, getProjects, toggleRoadmapPublic } from "@/lib/api";
import { Award, BarChart3, Share2 } from "lucide-react";

export function Header() {
    const {
        isAiPanelOpen,
        toggleAiPanel,
        toggleSidebar,
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
    const [showCertificate, setShowCertificate] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRoadmapPublic, setIsRoadmapPublic] = useState(false);
    const [projectStats, setProjectStats] = useState<Array<{
        id: string;
        title: string;
        totalNodes: number;
        completedNodes: number;
    }>>([]);

    // Fetch projects for dashboard
    const fetchProjectStats = useCallback(async () => {
        if (!user?.id) return;
        try {
            const projects = await getProjects(user.id);
            const stats = projects.map(p => {
                const roadmap = p.roadmaps?.[0];
                const roadmapNodes = Array.isArray(roadmap?.nodes) ? roadmap.nodes : [];
                return {
                    id: p.id,
                    title: p.title,
                    totalNodes: roadmapNodes.length,
                    completedNodes: roadmapNodes.filter((n: { data?: { isCompleted?: boolean; quizPassed?: boolean } }) => 
                        n.data?.isCompleted || n.data?.quizPassed
                    ).length,
                };
            });
            setProjectStats(stats);
        } catch (error) {
            console.error("Failed to fetch project stats:", error);
        }
    }, [user?.id]);

    // Fetch stats when dashboard opens
    useEffect(() => {
        if (showDashboard) {
            fetchProjectStats();
        }
    }, [showDashboard, fetchProjectStats]);

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

    const { getNodes } = useReactFlow();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        const allNodes = getNodes();
        if (allNodes.length === 0) {
            toast.error("No nodes to export");
            return;
        }

        const nodesBounds = getNodesBounds(allNodes);
        const padding = 50;
        const imageWidth = nodesBounds.width + (padding * 2);
        const imageHeight = nodesBounds.height + (padding * 2);

        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewportElement) {
            toast.error("Could not find canvas element");
            return;
        }

        setIsExporting(true);
        toast.loading("Generating image...", { id: "export" });

        try {
            const dataUrl = await toPng(viewportElement, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`,
                },
            });

            const link = document.createElement('a');
            link.download = `${currentProjectTitle || 'roadmap'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Roadmap exported successfully!", { id: "export" });
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export roadmap", { id: "export" });
        } finally {
            setIsExporting(false);
        }
    }, [getNodes, isDarkMode, currentProjectTitle]);

    // Handle toggle public for sharing
    const handleTogglePublic = useCallback(async (isPublic: boolean) => {
        if (!currentRoadmapId) {
            throw new Error("Please save your roadmap first");
        }

        await toggleRoadmapPublic(currentRoadmapId, isPublic);
        setIsRoadmapPublic(isPublic);
    }, [currentRoadmapId]);

    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
                {/* Mobile: Hamburger menu for sidebar */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-9 w-9"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Project Title / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground hidden sm:inline-block">SkillBridge</span>
                    <span className="text-muted-foreground hidden sm:inline-block">/</span>
                    <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-none">{currentProjectTitle}</span>
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
                        {/* Certificate Button - only show when 100% complete */}
                        {progressPercentage === 100 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCertificate(true)}
                                className="ml-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            >
                                <Award className="h-4 w-4 mr-1" />
                                Certificate
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Dashboard Button - Hidden on mobile */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setShowDashboard(true)} className="hidden sm:flex">
                                <BarChart3 className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Progress Dashboard</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Theme Toggle - Hidden on mobile */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden sm:flex">
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Switch Theme</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Separator orientation="vertical" className="hidden sm:block h-6 mx-1" />

                {/* Export Button */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleExport} 
                                disabled={isExporting || nodes.length === 0}
                                className="hidden sm:flex"
                            >
                                {isExporting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export as PNG</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Share Button */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowShare(true)}
                                disabled={nodes.length === 0}
                                className="hidden sm:flex"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share Roadmap</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                 {/* Save Button - Icon only on mobile */}
                 <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Mobile: Icon only */}
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={handleSave}
                                disabled={isSaving || nodes.length === 0}
                                className="sm:hidden h-9 w-9"
                             >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save Project (Ctrl+S)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Desktop: With text */}
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSave}
                                disabled={isSaving || nodes.length === 0}
                                className="hidden sm:flex"
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

                {/* AI Panel Toggle - Icon only on mobile */}
                {/* Mobile: Icon only */}
                <Button
                    variant={isAiPanelOpen ? "secondary" : "default"}
                    size="icon"
                    onClick={toggleAiPanel}
                    className={`sm:hidden h-9 w-9 ${!isAiPanelOpen ? "shadow-sm" : ""}`}
                >
                    {isAiPanelOpen ? (
                        <PanelRightClose className="h-4 w-4" />
                    ) : (
                        <MessageSquare className="h-4 w-4" />
                    )}
                </Button>
                {/* Desktop: With text */}
                <Button
                    variant={isAiPanelOpen ? "secondary" : "default"}
                    size="sm"
                    onClick={toggleAiPanel}
                    className={`hidden sm:flex ${!isAiPanelOpen ? "shadow-sm" : ""}`}
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

            {/* Certificate Modal */}
            <CertificateModal
                open={showCertificate}
                onOpenChange={setShowCertificate}
                userName={user?.name || user?.email || "Learner"}
                roadmapTitle={currentProjectTitle || "Learning Roadmap"}
                completedTopics={completedNodes}
                completionDate={new Date()}
                roadmapId={currentRoadmapId || undefined}
            />

            {/* Progress Dashboard */}
            <ProgressDashboard
                open={showDashboard}
                onOpenChange={setShowDashboard}
                projects={projectStats}
                currentProjectStats={currentProjectId ? {
                    title: currentProjectTitle || "Current Roadmap",
                    totalNodes,
                    completedNodes,
                } : null}
            />

            {/* Share Modal */}
            <ShareModal
                open={showShare}
                onOpenChange={setShowShare}
                roadmapId={currentRoadmapId}
                roadmapTitle={currentProjectTitle || "My Roadmap"}
                isPublic={isRoadmapPublic}
                onTogglePublic={handleTogglePublic}
            />
        </header>
    );
}
