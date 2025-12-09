import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, MoreHorizontal, Settings, LogOut, User, Globe, CreditCard, Loader2, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { NewProjectDialog } from "@/components/ui/NewProjectDialog";
import { createProject, getProjects, deleteProject, updateProject, type Project } from "@/lib/api";
import { toast } from "sonner";

export function Sidebar({ className }: { className?: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const { 
        currentProjectId,
        setCurrentProject, 
        setNodes, 
        setEdges, 
        clearRoadmap,
        setCurrentRoadmapId
    } = useRoadmapStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const data = await getProjects(user?.id);
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            toast.error("Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchProjects();
        }
    }, [user?.id]);

    // Auto-load roadmap on mount if there's a saved project
    useEffect(() => {
        if (!isLoading && projects.length > 0 && currentProjectId) {
            const savedProject = projects.find(p => p.id === currentProjectId);
            if (savedProject && savedProject.roadmaps && savedProject.roadmaps.length > 0) {
                const roadmap = savedProject.roadmaps[0];
                const nodes = Array.isArray(roadmap.nodes) ? roadmap.nodes : [];
                const edges = Array.isArray(roadmap.edges) ? roadmap.edges : [];
                setNodes(nodes);
                setEdges(edges);
                setCurrentRoadmapId(roadmap.id);
            }
        }
    }, [isLoading, projects, currentProjectId]);

    const handleCreateProject = async (title: string) => {
        if (!user?.id) {
            toast.error("User not authenticated");
            return;
        }
        const newProject = await createProject(title, user.id);
        setProjects((prev) => [newProject, ...prev]);
        
        // Clear roadmap for new project and set as current
        clearRoadmap();
        setCurrentProject(newProject.id, newProject.title);
        toast.success("Project created successfully");
    };

    const handleSelectProject = (project: Project) => {
        // Don't reload if already selected
        if (project.id === currentProjectId) return;

        // Load roadmap from project if exists
        if (project.roadmaps && project.roadmaps.length > 0) {
            const roadmap = project.roadmaps[0];
            // roadmap.nodes and roadmap.edges are stored as JSON
            const nodes = Array.isArray(roadmap.nodes) ? roadmap.nodes : [];
            const edges = Array.isArray(roadmap.edges) ? roadmap.edges : [];
            setNodes(nodes);
            setEdges(edges);
            setCurrentRoadmapId(roadmap.id); // Track roadmap ID for updates
        } else {
            // No roadmap yet - clear canvas
            clearRoadmap();
        }
        
        setCurrentProject(project.id, project.title);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        toast.success("Logged out successfully");
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
            
            toast.success("Project renamed successfully");
            setRenameDialogOpen(false);
        } catch (error) {
            toast.error("Failed to rename project");
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
            
            toast.success("Project deleted successfully");
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete project");
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
        <div className={cn("pb-4 w-64 border-r bg-background h-full flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Projects
                    </h2>
                    <div className="space-y-1">
                        <Button 
                            variant="secondary" 
                            className="w-full justify-start"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Library
                    </h2>
                    <div className="space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="px-4 py-2 text-sm text-muted-foreground">
                                No projects yet
                            </p>
                        ) : (
                            projects.map((project) => (
                                <div key={project.id} className="group relative flex items-center">
                                    <Button
                                        variant={currentProjectId === project.id ? "secondary" : "ghost"}
                                        className="w-full justify-start font-normal pr-8"
                                        onClick={() => handleSelectProject(project)}
                                    >
                                        <Folder className="mr-2 h-4 w-4" />
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
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={(e) => handleRenameClick(project, e)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => handleDeleteClick(project, e)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* User Profile Section - Now fixed at bottom */}
            {user && (
                <div className="px-3 py-2 mt-auto">
                    <div className="p-4 border-t bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src="" alt={user.name || user.email} />
                                    <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.name || user.email}</span>
                                    <span className="text-xs text-muted-foreground">{getTierLabel(user.tier)}</span>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Globe className="mr-2 h-4 w-4" />
                                        Language
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            )}

            <NewProjectDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onCreateProject={handleCreateProject}
            />

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rename Project</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Project name"
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename} disabled={!newTitle.trim()}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone. All roadmaps in this project will also be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
