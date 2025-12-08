import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ className }: { className?: string }) {
    const [projects] = useState(["Learn Go", "System Design", "React Roadmap"]);

    return (
        <div className={cn("pb-12 w-64 border-r bg-background h-full flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1">
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
                    <ScrollArea className="h-[300px] px-1">
                        <div className="space-y-1">
                            {projects.map((project) => (
                                <Button
                                    key={project}
                                    variant="ghost"
                                    className="w-full justify-start font-normal"
                                >
                                    <Folder className="mr-2 h-4 w-4" />
                                    {project}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
