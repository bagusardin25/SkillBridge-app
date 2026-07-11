import { useState, useEffect, useCallback } from "react";
import { Save, MessageSquare, PanelRightClose, Sun, Moon, Download, Loader2, Menu, LayoutList, Map, Focus, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { getNodesBounds, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
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
import { formatRelativeTime } from "@/lib/learningUtils";
import { cn } from "@/lib/utils";

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
        viewMode,
        setViewMode,
        isFocusMode,
        toggleFocusMode,
        saveStatus,
        lastSavedAt,
    } = useRoadmapStore();

    const { user } = useAuthStore();
    const { t, language } = useAppLanguage();
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

    // Focus mode: slim chrome
    if (isFocusMode) {
        return (
            <header className="sticky top-0 z-50 flex h-12 min-w-0 items-center justify-between gap-2 border-b border-b-muted/40 bg-background/90 px-2 backdrop-blur-xl sm:px-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-bold">{currentProjectTitle || "SkillBridge"}</span>
                    {totalNodes > 0 && (
                        <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {progressPercentage}%
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <Button variant="secondary" size="sm" className="h-8 px-2 text-xs sm:px-3" onClick={toggleFocusMode}>
                        {t.ux.exitFocus}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleAiPanel}
                        aria-label={t.common.ai}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 flex h-14 min-w-0 items-center justify-between gap-1 border-b border-b-muted/40 bg-background/80 px-2 backdrop-blur-xl sm:gap-2 sm:px-3 md:px-4">
            {/* Left: menu + title (can shrink) */}
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                {/* Always available on mobile so user can open projects while on canvas */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 md:hidden"
                    onClick={toggleSidebar}
                    aria-label={t.sidebar.openMenu}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="hidden shrink-0 font-semibold text-muted-foreground lg:inline-block">SkillBridge</span>
                    <span className="hidden text-muted-foreground lg:inline-block">/</span>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleTitleKeyDown}
                            className="h-7 w-full max-w-[10rem] rounded-md border border-primary/50 bg-muted px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-[14rem]"
                            autoFocus
                        />
                    ) : (
                        <span
                            className="cursor-pointer truncate font-bold text-foreground decoration-primary/50 hover:underline"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to edit project name"
                        >
                            {currentProjectTitle || "SkillBridge"}
                        </span>
                    )}
                </div>

                {totalNodes > 0 && (
                    <div className="hidden min-w-0 items-center gap-2 xl:flex" title={`${completedNodes}/${totalNodes}`}>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">{progressPercentage}%</span>
                    </div>
                )}

                {currentRoadmapId && (
                    <span
                        className="hidden items-center gap-1 text-[10px] text-muted-foreground xl:inline-flex"
                        aria-live="polite"
                    >
                        {saveStatus === "saving" && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {t.ux.saving}
                            </>
                        )}
                        {saveStatus === "saved" && (
                            <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                {lastSavedAt
                                    ? t.ux.lastSaved.replace(
                                          "{time}",
                                          formatRelativeTime(lastSavedAt, language === "id" ? "id" : "en")
                                      )
                                    : t.ux.savedJustNow}
                            </>
                        )}
                        {saveStatus === "error" && (
                            <span className="text-destructive">{t.ux.saveError}</span>
                        )}
                    </span>
                )}
            </div>

            {/* Right: actions (never shrink) */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                {/* Map / List — compact */}
                {nodes.length > 0 && (
                    <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
                        <Button
                            variant={viewMode === "map" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("map")}
                            aria-label={t.ux.mapView}
                            aria-pressed={viewMode === "map"}
                        >
                            <Map className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("list")}
                            aria-label={t.ux.listView}
                            aria-pressed={viewMode === "list"}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 lg:flex"
                    onClick={toggleFocusMode}
                    aria-label={t.ux.focusMode}
                >
                    <Focus className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    disabled={isSaving || nodes.length === 0}
                    className="h-9 w-9"
                    aria-label={t.header.saveProject}
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="hidden h-9 w-9 sm:flex"
                >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Overflow menu: share/export/clear + mobile-only extras */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {progressPercentage === 100 && (
                            <DropdownMenuItem onClick={() => setShowCertificate(true)}>
                                <Award className="mr-2 h-4 w-4" />
                                {t.header.certificate}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setShowShare(true)} disabled={nodes.length === 0}>
                            <Share2 className="mr-2 h-4 w-4" />
                            {t.header.shareRoadmap}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport} disabled={isExporting || nodes.length === 0}>
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {t.header.exportToPng}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleFocusMode} className="lg:hidden">
                            <Focus className="mr-2 h-4 w-4" />
                            {t.ux.focusMode}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDashboard(true)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            {t.header.progressDashboard}
                        </DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem onClick={handleClearCanvas} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.header.clearCanvas}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* AI toggle — icon on small, labeled on lg+ */}
                <Button
                    variant={(isAiPanelOpen || isDetailPanelOpen) ? "secondary" : "default"}
                    size="icon"
                    onClick={() => {
                        if (isDetailPanelOpen && !isAiPanelOpen) {
                            useRoadmapStore.getState().closeDetailPanel();
                        } else {
                            toggleAiPanel();
                            if (isAiPanelOpen) {
                                useRoadmapStore.getState().closeDetailPanel();
                            }
                        }
                    }}
                    className={cn(
                        "h-9 w-9 shrink-0 lg:hidden",
                        !(isAiPanelOpen || isDetailPanelOpen) &&
                            "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    )}
                    aria-label={t.common.ai}
                >
                    {(isAiPanelOpen || isDetailPanelOpen) ? (
                        <PanelRightClose className="h-4 w-4" />
                    ) : (
                        <MessageSquare className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant={(isAiPanelOpen || isDetailPanelOpen) ? "secondary" : "default"}
                    size="sm"
                    onClick={() => {
                        if (isDetailPanelOpen && !isAiPanelOpen) {
                            useRoadmapStore.getState().closeDetailPanel();
                        } else {
                            toggleAiPanel();
                            if (isAiPanelOpen) {
                                useRoadmapStore.getState().closeDetailPanel();
                            }
                        }
                    }}
                    className={cn(
                        "hidden h-9 lg:inline-flex",
                        !(isAiPanelOpen || isDetailPanelOpen) &&
                            "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    )}
                >
                    {(isAiPanelOpen || isDetailPanelOpen) ? (
                        <PanelRightClose className="mr-2 h-4 w-4" />
                    ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    {(isAiPanelOpen || isDetailPanelOpen) ? t.common.close : t.common.ai}
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
