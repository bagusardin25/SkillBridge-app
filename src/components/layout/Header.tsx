import { Save, MessageSquare, PanelRightClose, Menu, Sun, Moon, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
    const {
        isAiPanelOpen,
        toggleAiPanel,
        toggleSidebar,
        isDarkMode,
        toggleTheme,
        saveToLocalStorage,
        currentProjectTitle
    } = useRoadmapStore();

    const handleSave = () => {
        saveToLocalStorage();
        toast.success("Project saved successfully");
    };

    const handleExport = () => {
        // Mock export for now
        toast.info("Exporting project as image...", {
            description: "This feature will be available soon."
        });
    };

    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Sidebar</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Project Title / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground hidden sm:inline-block">SkillBridge</span>
                    <span className="text-muted-foreground hidden sm:inline-block">/</span>
                    <span className="font-bold text-foreground">{currentProjectTitle}</span>
                </div>
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
                             <Button variant="outline" size="sm" onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save Project</TooltipContent>
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
        </header>
    );
}
