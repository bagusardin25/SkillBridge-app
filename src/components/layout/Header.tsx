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

import { SaveProjectDialog } from "@/components/ui/SaveProjectDialog";
import { CertificateModal } from "@/components/ui/CertificateModal";
import { ProgressDashboard } from "@/components/ui/ProgressDashboard";
import { ShareModal } from "@/components/ui/ShareModal";
import { createProject, createRoadmap, updateRoadmap, toggleRoadmapPublic } from "@/lib/api";
import { Award, BarChart3, Share2, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppLanguage } from "@/contexts/LanguageContext";

export function Header() {
    const {
        isAiPanelOpen,
        isDetailPanelOpen,
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
        incrementProjectsVersion,
    } = useRoadmapStore();

    const { user } = useAuthStore();
    const { t } = useAppLanguage();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRoadmapPublic, setIsRoadmapPublic] = useState(false);

    // For Inline Editing Title
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState("");

    useEffect(() => {
        setEditTitleValue(currentProjectTitle || "");
    }, [currentProjectTitle]);

    // Removed fetchProjectStats from here, it is now in ProgressDashboard.tsx

    // Calculate progress - count both isCompleted and quizPassed nodes
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.data?.isCompleted || n.data?.quizPassed).length;
    const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    // Handle save - create new project if none exists, otherwise update
    const handleSave = useCallback(async () => {
        if (nodes.length === 0) {
            toast.error(t.toasts.noRoadmapToSave);
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
                toast.success(t.toasts.roadmapSaved);
            } catch (error) {
                toast.error(t.toasts.roadmapSaveFailed);
                console.error(error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [nodes, edges, currentProjectId, currentRoadmapId]);

    // Handle save new project from dialog
    const handleSaveNewProject = async (title: string) => {
        if (!user?.id) {
            toast.error(t.toasts.pleaseLoginFirst);
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

            // Notify sidebar to refresh via callback
            if (onProjectCreated) {
                onProjectCreated(project.id);
            }

            // Also trigger version-based refresh as a fallback
            incrementProjectsVersion();

            toast.success(t.toasts.projectCreatedName.replace("{title}", title));
        } catch (error) {
            toast.error(t.toasts.projectCreateFailed);
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

    const handleClearCanvas = () => {
        if (confirm(t.header.clearCanvasConfirm)) {
            // Need to get access to these functions via the store
            useRoadmapStore.getState().setNodes([]);
            useRoadmapStore.getState().setEdges([]);
        }
    };

    const handleExport = useCallback(async () => {
        const allNodes = getNodes();
        if (allNodes.length === 0) {
            toast.error(t.toasts.noNodesToExport);
            return;
        }

        setIsExporting(true);
        toast.loading(t.header.generatingImage, { id: "export" });

        try {
            // Get actual DOM dimensions for each node to ensure highly accurate bounds calculation
            const nodesWithMeasuredDimensions = allNodes.map((node) => {
                const el = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement;
                return {
                    ...node,
                    width: el ? el.offsetWidth : (node.measured?.width || node.width || 320),
                    height: el ? el.offsetHeight : (node.measured?.height || node.height || 120),
                };
            });

            // Calculate the total bounding box using React Flow's built-in utility
            const nodesBounds = getNodesBounds(nodesWithMeasuredDimensions);
            
            // Provide generous padding to avoid clipping shadows/handles
            const padding = 180;
            // Extra bias so the content sits more centrally in the exported image
            const centerBias = 140;
            const exportBounds = {
                x: nodesBounds.x - padding,
                y: nodesBounds.y - padding,
                width: nodesBounds.width + padding * 2 + centerBias * 2,
                height: nodesBounds.height + padding * 2 + centerBias * 2,
            };

            const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewportElement) {
                toast.error(t.header.canvasElementNotFound, { id: "export" });
                setIsExporting(false);
                return;
            }

            // Capture the image using html-to-image, applying the transform ONLY to the clone via style
            const dataUrl = await toPng(viewportElement, {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                width: exportBounds.width,
                height: exportBounds.height,
                style: {
                    width: `${exportBounds.width}px`,
                    height: `${exportBounds.height}px`,
                    // Move content so the top-left of bounds aligns to (0,0)
                    transform: `translate(${-exportBounds.x + centerBias}px, ${-exportBounds.y + centerBias}px) scale(1)`,
                    transformOrigin: "0 0",
                    overflow: "visible",
                },
                // Filter out UI overlays
                filter: (domNode: HTMLElement) => {
                    const cls = domNode.className || '';
                    if (typeof cls === 'string') {
                        if (cls.includes('react-flow__panel')) return false;
                        if (cls.includes('react-flow__controls')) return false;
                        if (cls.includes('react-flow__minimap')) return false;
                    }
                    return true;
                },
            });

            const link = document.createElement('a');
            link.download = `${currentProjectTitle || 'roadmap'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success(t.toasts.roadmapExported, { id: "export" });
        } catch (error) {
            console.error("Export failed:", error);
            toast.error(t.toasts.exportFailed, { id: "export" });
        } finally {
            setIsExporting(false);
        }
    }, [getNodes, isDarkMode, currentProjectTitle]);

    // Handle toggle public for sharing
    const handleTogglePublic = useCallback(async (isPublic: boolean) => {
        if (!currentRoadmapId) {
            throw new Error(t.header.pleaseSaveFirst);
        }

        await toggleRoadmapPublic(currentRoadmapId, isPublic);
        setIsRoadmapPublic(isPublic);
    }, [currentRoadmapId]);

    const handleTitleSubmit = async () => {
        if (editTitleValue.trim() !== "" && editTitleValue !== currentProjectTitle && currentProjectId) {
            // Update Title (Simulated for UI, implement API update if backend supports)
            setCurrentProject(currentProjectId, editTitleValue.trim());
        } else {
            setEditTitleValue(currentProjectTitle || "");
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleTitleSubmit();
        } else if (e.key === "Escape") {
            setEditTitleValue(currentProjectTitle || "");
            setIsEditingTitle(false);
        }
    };

    return (
        <header className="h-14 border-b border-b-muted/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                {/* Mobile: Hamburger menu for sidebar - Hide when right panel is open */}
                {!(isAiPanelOpen || isDetailPanelOpen) && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-9 w-9"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                {/* Project Title / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground hidden sm:inline-block">SkillBridge</span>
                    <span className="text-muted-foreground hidden sm:inline-block">/</span>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleTitleKeyDown}
                            className="h-7 px-2 py-1 text-sm font-bold bg-muted border border-primary/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 w-32 sm:w-auto"
                            autoFocus
                        />
                    ) : (
                        <span
                            className="font-bold text-foreground truncate max-w-[120px] sm:max-w-none cursor-pointer hover:underline decoration-primary/50"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to edit project name"
                        >
                            {currentProjectTitle}
                        </span>
                    )}
                </div>



                {/* Certificate Button - Show separately when 100% complete */}
                {progressPercentage === 100 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCertificate(true)}
                        className="hidden md:flex ml-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                        <Award className="h-4 w-4 mr-1" />
                        <span className="hidden lg:inline">{t.header.certificate}</span>
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

                {/* Save Button (Consolidated) */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || nodes.length === 0}
                                className="flex"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 sm:mr-2" />
                                )}
                                <span className="hidden sm:inline">{isSaving ? t.common.saving : t.header.saveProject}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.header.saveProjectShortcut}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Theme Toggle - Hidden on mobile */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden sm:flex h-9 w-9">
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.header.switchTheme}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Separator orientation="vertical" className="hidden sm:block h-6 mx-1" />

                {/* More Options Dropdown (Consolidated Export, Share, Clear Canvas) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setShowShare(true)} disabled={nodes.length === 0}>
                            <Share2 className="h-4 w-4 mr-2" />
                            {t.header.shareRoadmap}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport} disabled={isExporting || nodes.length === 0}>
                            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            {t.header.exportToPng}
                        </DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem onClick={handleClearCanvas} className="text-destructive focus:text-destructive group">
                            <Trash2 className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                            {t.header.clearCanvas}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile: Certificate Button - Show when 100% complete */}
                {progressPercentage === 100 && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCertificate(true)}
                        className="sm:hidden h-9 w-9 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 animate-pulse"
                    >
                        <Award className="h-4 w-4" />
                    </Button>
                )}

                {/* AI Panel Toggle - Mobile: Only show when panel is closed and detail isn't open */}
                {!isAiPanelOpen && !isDetailPanelOpen && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleAiPanel}
                        className="sm:hidden h-9 w-9 shadow-sm bg-black dark:bg-neutral-900 text-white hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:text-white border-transparent"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                )}
                {/* Desktop: With text */}
                <Button
                    variant={(isAiPanelOpen || isDetailPanelOpen) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                        if (isDetailPanelOpen && !isAiPanelOpen) {
                            // If detail is open but AI is not, close detail
                            // or could switch to AI, but user requested close sync
                            useRoadmapStore.getState().closeDetailPanel();
                        } else {
                            toggleAiPanel();
                            if (isAiPanelOpen) {
                                useRoadmapStore.getState().closeDetailPanel();
                            }
                        }
                    }}
                    className={`hidden sm:flex ${!(isAiPanelOpen || isDetailPanelOpen) ? "shadow-sm bg-black dark:bg-neutral-900 text-white hover:bg-neutral-800 dark:hover:bg-neutral-800 hover:text-white border-transparent" : ""}`}
                >
                    {(isAiPanelOpen || isDetailPanelOpen) ? (
                        <PanelRightClose className="h-4 w-4 mr-2" />
                    ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    {(isAiPanelOpen || isDetailPanelOpen) ? t.common.close : t.common.ai}
                </Button>

                {/* User Avatar Menu */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full ml-1 overflow-hidden border">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name || "User avatar"} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                                        {(user.name || user.email || 'U').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5 text-sm">
                                <div className="font-semibold">{user.name || "Learner"}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                            <Separator className="my-1" />
                            <DropdownMenuItem onClick={() => setShowDashboard(true)}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {t.header.progressDashboard}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(t.toasts.settingsComingSoon)}>
                                <Save className="h-4 w-4 mr-2" />
                                {t.header.mySettings}
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem onClick={() => useAuthStore.getState().logout()} className="text-destructive focus:text-destructive">
                                {t.common.logOut}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
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
