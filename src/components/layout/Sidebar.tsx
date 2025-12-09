import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Folder, MoreHorizontal, Settings, LogOut, User, Globe, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { NewProjectDialog } from "@/components/ui/NewProjectDialog";
import { createProject, getProjects, type Project } from "@/lib/api";
import { toast } from "sonner";

export function Sidebar({ className }: { className?: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { currentProjectTitle, setProjectTitle } = useRoadmapStore();
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

    const handleCreateProject = async (title: string) => {
        if (!user?.id) {
            toast.error("User not authenticated");
            return;
        }
        const newProject = await createProject(title, user.id);
        setProjects((prev) => [newProject, ...prev]);
        setProjectTitle(newProject.title);
        toast.success("Project created successfully");
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        toast.success("Logged out successfully");
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
                                <Button
                                    key={project.id}
                                    variant={currentProjectTitle === project.title ? "secondary" : "ghost"}
                                    className="w-full justify-start font-normal"
                                    onClick={() => setProjectTitle(project.title)}
                                >
                                    <Folder className="mr-2 h-4 w-4" />
                                    {project.title}
                                </Button>
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
        </div>
    );
}
