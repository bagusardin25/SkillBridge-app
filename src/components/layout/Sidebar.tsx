import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Folder, MoreHorizontal, Settings, LogOut, User, Globe, CreditCard } from "lucide-react";
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

export function Sidebar({ className }: { className?: string }) {
    const [projects] = useState(["Learn Go", "System Design", "React Roadmap"]);
    const { currentProjectTitle, setProjectTitle } = useRoadmapStore();

    return (
        <div className={cn("pb-4 w-64 border-r bg-background h-full flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Projects
                    </h2>
                    <div className="space-y-1">
                        <Button variant="secondary" className="w-full justify-start">
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
                        {projects.map((project) => (
                            <Button
                                key={project}
                                variant={currentProjectTitle === project ? "secondary" : "ghost"}
                                className="w-full justify-start font-normal"
                                onClick={() => setProjectTitle(project)}
                            >
                                <Folder className="mr-2 h-4 w-4" />
                                {project}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Profile Section - Now fixed at bottom */}
            <div className="px-3 py-2 mt-auto">
                <div className="p-4 border-t bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Bagus Ardin</span>
                                <span className="text-xs text-muted-foreground">Pro Plan</span>
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
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
