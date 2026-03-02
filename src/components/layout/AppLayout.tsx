import React from "react";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { Header } from "./Header";
import { ReactFlowProvider } from "@xyflow/react";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAiPanelOpen, isDetailPanelOpen, isDarkMode, selectedNodeIds, isSidebarOpen, toggleSidebar } = useRoadmapStore();

    // Show detail panel when a node is selected and detail panel is open
    const showDetailPanel = isDetailPanelOpen && selectedNodeIds.length > 0;

    // Sync theme with store on mount
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <ReactFlowProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                {/* Left Sidebar - Desktop: Always visible */}
                <div className="hidden md:flex h-full">
                    <Sidebar />
                </div>

                {/* Left Sidebar - Mobile: Overlay drawer */}
                {isSidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-[60]">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
                            onClick={toggleSidebar}
                        />
                        {/* Sidebar panel */}
                        <div className="absolute left-0 top-0 h-full w-72 bg-background shadow-xl animate-in slide-in-from-left duration-300">
                            <Sidebar />
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <Header />
                    <main className="flex-1 overflow-hidden relative bg-muted/10">
                        {children}
                    </main>
                </div>

                {/* Right Panel - Chat or Detail */}
                {/* Mobile: Overlay drawer with backdrop - start below header */}
                {showDetailPanel && (
                    <div className="md:hidden fixed inset-0 z-[60]">
                        {/* Detail panel - fullscreen on mobile */}
                        <div className="absolute inset-0 bg-background animate-in fade-in duration-200">
                            <NodeDetailPanel />
                        </div>
                    </div>
                )}
                {/* Mobile: Chat Panel (show when open and no detail panel) */}
                {isAiPanelOpen && !showDetailPanel && (
                    <div className="md:hidden fixed inset-0 z-[60]">
                        {/* Chat panel - fullscreen on mobile */}
                        <div className="absolute inset-0 bg-background animate-in fade-in duration-200">
                            <ChatPanel />
                        </div>
                    </div>
                )}

                {/* Desktop: Side panels - Both can potentially be visible */}
                <div className="hidden md:flex h-full">
                    {/* Chat Panel - Always exists when open */}
                    {isAiPanelOpen && (
                        <div
                            className={`border-l bg-background h-full transition-all duration-300 ease-in-out w-80 animate-in slide-in-from-right ${showDetailPanel ? 'hidden' : ''}`}
                        >
                            <ChatPanel />
                        </div>
                    )}

                    {/* Detail Panel - Shown on top of chat when node selected */}
                    {showDetailPanel && (
                        <div className="h-full transition-all duration-300 ease-in-out animate-in slide-in-from-right">
                            <NodeDetailPanel />
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}

