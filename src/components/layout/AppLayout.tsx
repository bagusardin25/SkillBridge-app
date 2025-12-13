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
    const { isAiPanelOpen, isDetailPanelOpen, isDarkMode, selectedNodeIds } = useRoadmapStore();

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
                {/* Left Sidebar - Always rendered, handles its own collapsed state */}
                <div className="hidden md:flex h-full">
                    <Sidebar />
                </div>

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
                {/* Mobile: Full-screen overlay */}
                {showDetailPanel && (
                    <div className="md:hidden fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-300">
                        <NodeDetailPanel />
                    </div>
                )}
                {showChatPanel && (
                    <div className="md:hidden fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-300">
                        <ChatPanel />
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
