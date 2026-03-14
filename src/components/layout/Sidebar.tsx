import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, MoreHorizontal, Settings, LogOut, User, Globe, CreditCard, Trash2, Pencil, PanelLeftClose, PanelLeft, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { NewProjectDialog } from "@/components/ui/NewProjectDialog";
import { Logo } from "@/components/ui/Logo";
import { createProject, getProjects, deleteProject, updateProject, getQuizResultsForRoadmap, type Project } from "@/lib/api";
import { mergeNodesWithQuizResults } from "@/lib/roadmapUtils";
import { toast } from "sonner";
import { useAppLanguage } from "@/contexts/LanguageContext";

export function Sidebar({ className }: { className?: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newProjectId, setNewProjectId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const {
        currentProjectId,
        setCurrentProject,
        setNodes,
        setEdges,
        clearRoadmap,
        setCurrentRoadmapId,
        setOnProjectCreated,
        isSidebarOpen,
        toggleSidebar,
        projectsVersion,
    } = useRoadmapStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useAppLanguage();

    // Filter projects based on search query
    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        return projects.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    const fetchProjects = async () => {
        try {
            const data = await getProjects(user?.id);
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            toast.error(t.toasts.loadFailed);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user?.id]);

    // Re-fetch projects when projectsVersion changes (triggered by Header or ChatPanel)
    useEffect(() => {
        if (user?.id && projectsVersion > 0) {
            fetchProjects();
        }
    }, [projectsVersion, user?.id]);

    // Register refresh callback for when new project is created from chat
    useEffect(() => {
        setOnProjectCreated((projectId: string) => {
            fetchProjects();
            setNewProjectId(projectId);
            setTimeout(() => setNewProjectId(null), 1000);
        });
        return () => {
            setOnProjectCreated(null);
        };
    }, [setOnProjectCreated]);

    const handleCreateProject = async (title: string) => {
        if (!user?.id) {
            toast.error(t.toasts.userNotAuth);
            return;
        }
        const newProject = await createProject(title, user.id);
        setProjects((prev) => [newProject, ...prev]);

        // Clear roadmap for new project and set as current
        clearRoadmap();
        setCurrentProject(newProject.id, newProject.title);
        toast.success(t.toasts.projectCreated);
    };

    const handleSelectProject = async (project: Project) => {
        // Don't reload if already selected
        if (project.id === currentProjectId) return;

        // Load roadmap from project if exists
        if (project.roadmaps && project.roadmaps.length > 0) {
            const roadmap = project.roadmaps[0];
            // roadmap.nodes and roadmap.edges are stored as JSON
            let nodes = Array.isArray(roadmap.nodes) ? roadmap.nodes : [];
            const edges = Array.isArray(roadmap.edges) ? roadmap.edges : [];

            // Fetch quiz results and merge with nodes to restore completion status
            if (user?.id) {
                const quizResults = await getQuizResultsForRoadmap(roadmap.id, user.id);
                nodes = mergeNodesWithQuizResults(nodes, quizResults);
            }

            setNodes(nodes);
            setEdges(edges);
            setCurrentRoadmapId(roadmap.id); // Track roadmap ID for updates
        } else {
            // No roadmap yet - clear canvas
            clearRoadmap();
        }

        setCurrentProject(project.id, project.title);

        // Tutup sidebar HANYA di mobile (dan hanya jika sedang terbuka)
        if (window.innerWidth < 768 && isSidebarOpen) {
            toggleSidebar();
        }
    };

    // Helper untuk navigasi - tidak tutup sidebar agar saat back, user kembali ke sidebar
    const handleNavigate = (path: string) => {
        navigate(path);
        // Jangan tutup sidebar saat navigate ke settings pages
        // Biarkan sidebar tetap terbuka agar saat back (navigate(-1)), user kembali ke sidebar
    };

    const handleLogout = () => {
        logout();
        // Tutup sidebar HANYA di mobile (dan hanya jika sedang terbuka)
        if (window.innerWidth < 768 && isSidebarOpen) {
            toggleSidebar();
        }
        navigate("/");
        toast.success(t.toasts.loggedOut);
    };

    const handleRenameClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(project);
        setNewTitle(project.title);
        setRenameDialogOpen(true);
    };

    const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(project);
        setDeleteDialogOpen(true);
    };

    const handleRename = async () => {
        if (!selectedProject || !newTitle.trim()) return;

        try {
            const updated = await updateProject(selectedProject.id, newTitle.trim());
            setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));

            // Update current project title if it's the one being renamed
            if (currentProjectId === selectedProject.id) {
                setCurrentProject(updated.id, updated.title);
            }

            toast.success(t.toasts.projectRenamed);
            setRenameDialogOpen(false);
        } catch (error) {
            toast.error(t.toasts.renameFailed);
        }
    };

    const handleDelete = async () => {
        if (!selectedProject) return;

        try {
            await deleteProject(selectedProject.id);
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));

            // Clear canvas if deleting current project
            if (currentProjectId === selectedProject.id) {
                clearRoadmap();
                setCurrentProject(null, "");
            }

            toast.success(t.toasts.projectDeleted);
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error(t.toasts.deleteFailed);
        }
    };

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    const getTierLabel = (tier: string) => {
        const labels: Record<string, string> = {
            FREE: "Free Plan",
            PRO: "Pro Plan",
            ENTERPRISE: "Enterprise",
        };
        return labels[tier] || tier;
    };

    return (
        <div className={cn(
            "border-r bg-background h-full flex flex-col",
            "transition-all duration-300 ease-in-out",
            // Mobile: always full width, Desktop: depends on isSidebarOpen
            "w-full md:w-auto",
            isSidebarOpen ? "md:w-64" : "md:w-14",
            className
        )}>
            {/* Collapsed View - Desktop only */}
            <div className={cn(
                "flex-col items-center py-3 gap-2 h-full",
                "transition-opacity duration-300",
                // Hide on mobile, show on desktop when collapsed
                "hidden",
                !isSidebarOpen && "md:flex"
            )}>
                {/* Expand button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-10 w-10"
                    title={t.sidebar.expandSidebar}
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>

                <div className="w-8 h-px bg-border my-1" />

                {/* New Project */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDialogOpen(true)}
                    className="h-10 w-10"
                    title={t.sidebar.newProject}
                >
                    <Plus className="h-5 w-5" />
                </Button>

                {/* Search - expands sidebar */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-10 w-10"
                    title={t.sidebar.searchProjects}
                >
                    <Search className="h-5 w-5" />
                </Button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* User Avatar */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="" alt={user.name || user.email} />
                                    <AvatarFallback className="text-xs">{getInitials(user.name, user.email)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right" className="w-56 z-[70]">
                            <DropdownMenuLabel>{t.sidebar.myAccount}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
                                <User className="mr-2 h-4 w-4" />
                                {t.sidebar.profile}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                {t.sidebar.settings}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNavigate("/billing")}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t.sidebar.billing}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleNavigate("/language")}>
                                <Globe className="mr-2 h-4 w-4" />
                                {t.sidebar.language}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t.common.logOut}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Expanded View - Always show on mobile, show on desktop when expanded */}
            <div className={cn(
                "flex flex-col h-full pb-4",
                "transition-opacity duration-300",
                // Always show on mobile, on desktop show only when sidebar is open
                "flex opacity-100",
                !isSidebarOpen && "md:hidden md:opacity-0"
            )}>
                {/* Header with toggle */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <Logo size={28} />
                        <span className="font-semibold text-lg whitespace-nowrap">SkillBridge</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Mobile: Close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="h-8 w-8 md:hidden"
                            title={t.sidebar.closeSidebar}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        {/* Desktop: Collapse button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="h-8 w-8 hidden md:flex"
                            title={t.sidebar.collapseSidebar}
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="px-3 py-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.sidebar.searchProjects}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9"
                        />
                    </div>
                </div>

                <div className="space-y-4 py-4 flex-1 overflow-y-auto w-full">
                    <div className="px-4">
                        <div className="space-y-1">
                            <Button
                                variant="secondary"
                                className="w-full justify-start shadow-sm hover:shadow-md transition-shadow"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t.sidebar.newProject}
                            </Button>
                        </div>
                    </div>

                    <div className="px-2">
                        <h2 className="mb-3 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            {t.sidebar.yourProjects}
                        </h2>
                        <div className="space-y-1 px-2">
                            {isLoading ? (
                                <div className="space-y-3 px-2">
                                    <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                                    <div className="h-10 bg-muted/50 rounded-lg animate-pulse w-5/6" />
                                    <div className="h-10 bg-muted/50 rounded-lg animate-pulse w-4/5" />
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-muted-foreground text-center bg-muted/20 rounded-lg border border-dashed border-border/50">
                                    {searchQuery ? t.sidebar.noMatching : t.sidebar.noProjects}
                                </p>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={cn(
                                            "group relative flex items-center rounded-lg transition-colors",
                                            newProjectId === project.id && "animate-in fade-in slide-in-from-left-2 duration-300",
                                            currentProjectId === project.id ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted/60"
                                        )}
                                    >
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start font-normal pr-8 transition-all duration-300 h-10 rounded-lg",
                                                currentProjectId === project.id
                                                    ? "text-primary font-medium hover:bg-transparent"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-transparent hover:translate-x-1"
                                            )}
                                            onClick={() => handleSelectProject(project)}
                                        >
                                            <div className={cn(
                                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-full transition-all duration-300",
                                                currentProjectId === project.id ? "h-6 opacity-100" : "opacity-0"
                                            )} />
                                            <Folder className={cn("mr-3 h-4 w-4 transition-transform group-hover:scale-110", currentProjectId === project.id && "fill-primary/20 text-primary")} />
                                            <span className="truncate">{project.title}</span>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 z-[70]">
                                                <DropdownMenuItem onClick={(e) => handleRenameClick(project, e)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    {t.sidebar.rename}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={(e) => handleDeleteClick(project, e)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t.common.delete}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                {user && (
                    <div className="px-3 py-2 mt-auto">
                        <div className="p-3 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border flex-shrink-0">
                                        <AvatarImage src={user.avatarUrl || ""} alt={user.name || user.email} />
                                        <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">{user.name || user.email}</span>
                                        <span className="text-xs text-muted-foreground">{getTierLabel(user.tier)}</span>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">{t.sidebar.openMenu}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 z-[70]">
                                        <DropdownMenuLabel>{t.sidebar.myAccount}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleNavigate("/profile")}>
                                            <User className="mr-2 h-4 w-4" />
                                            {t.sidebar.profile}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            {t.sidebar.settings}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleNavigate("/billing")}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {t.sidebar.billing}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleNavigate("/language")}>
                                            <Globe className="mr-2 h-4 w-4" />
                                            {t.sidebar.language}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            {t.common.logOut}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs - always rendered */}
            <NewProjectDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onCreateProject={handleCreateProject}
            />

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t.sidebar.renameProject}</DialogTitle>
                        <DialogDescription>
                            {t.sidebar.renameDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={t.sidebar.projectName}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleRename} disabled={!newTitle.trim()}>
                            {t.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.sidebar.deleteProject}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.sidebar.deleteDescription.replace("{title}", selectedProject?.title || "")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t.common.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
