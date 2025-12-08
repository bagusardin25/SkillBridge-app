import { Save, Eye, Pencil, MessageSquare, PanelRightClose, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export function Header() {
    const { isEditMode, toggleEditMode, isAiPanelOpen, toggleAiPanel, toggleSidebar, isDarkMode, toggleTheme, saveToLocalStorage } = useRoadmapStore();

    return (
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
                    <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold">SkillBridge</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Edit Mode Toggle
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Switch
                        checked={isEditMode}
                        onCheckedChange={toggleEditMode}
                        aria-label="Toggle edit mode"
                    />
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {isEditMode ? "Edit" : "View"}
                    </span>
                </div> */}

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Save Button */}
                <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>

                {/* AI Panel Toggle */}
                <Button
                    variant={isAiPanelOpen ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleAiPanel}
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
