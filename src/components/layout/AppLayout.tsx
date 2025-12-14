import React from "react";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { Header } from "./Header";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ReactFlowProvider } from "@xyflow/react";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useLocation } from "react-router-dom";

// Helper component to conditionally render toolbar
function BottomToolbarWrapper() {
    const location = useLocation();
    if (location.pathname === "/profile") return null;
    return <BottomToolbar />;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAiPanelOpen, isDetailPanelOpen, isDarkMode, selectedNodeIds, isSidebarOpen, toggleSidebar, toggleAiPanel } = useRoadmapStore();

    // Show detail panel when a node is selected and detail panel is open
    const showDetailPanel = isDetailPanelOpen && selectedNodeIds.length > 0;
    const showChatPanel = isAiPanelOpen && !showDetailPanel;

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

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <Header />
                    <main className="flex-1 overflow-hidden relative bg-muted/10">
                        {children}
                    </main>
                    {/* Floating Bottom Toolbar - Hide on Profile Page based on path */}
                    <BottomToolbarWrapper />
                </div>

                {/* Right Panel - Chat or Detail */}
                {/* Mobile: Overlay drawer with backdrop - start below header */}
                {showDetailPanel && (
                    <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-[60]">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" 
                            onClick={() => useRoadmapStore.getState().closeDetailPanel()}
                        />
                        {/* Detail panel */}
                        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl animate-in slide-in-from-right duration-300">
                            <NodeDetailPanel />
                        </div>
                    </div>
                )}
                {showChatPanel && (
                    <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-[60]">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" 
                            onClick={toggleAiPanel}
                        />
                        {/* Chat panel */}
                        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl animate-in slide-in-from-right duration-300">
                            <ChatPanel />
                        </div>
                    </div>
                )}

                {/* Desktop: Side panels */}
                {showDetailPanel ? (
                    <div className="hidden md:block h-full transition-all duration-300 ease-in-out animate-in slide-in-from-right">
                        <NodeDetailPanel />
                    </div>
                ) : (
                    <div
                        className={`
                            hidden md:block border-l bg-background h-full
                            transition-all duration-300 ease-in-out
                            ${showChatPanel ? "w-80 translate-x-0 animate-in slide-in-from-right" : "w-0 translate-x-full border-l-0"}
                        `}
                    >
                        <div className="w-80 h-full">
                            <ChatPanel />
                        </div>
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
}
