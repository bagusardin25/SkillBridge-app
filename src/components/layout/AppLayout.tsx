import React from "react";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { Header } from "./Header";
import { ReactFlowProvider } from "@xyflow/react";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { cn } from "@/lib/utils";

/**
 * Breakpoints:
 * - < lg (1024px): sidebar as drawer; chat/detail as fullscreen overlays
 * - >= lg: sidebar docked; chat/detail as side panel (max ~20rem / 24rem)
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
    const {
        isAiPanelOpen,
        isDetailPanelOpen,
        isDarkMode,
        selectedNodeIds,
        isSidebarOpen,
        toggleSidebar,
        isFocusMode,
        setFocusMode,
        closeDetailPanel,
        toggleAiPanel,
    } = useRoadmapStore();

    const showDetailPanel = isDetailPanelOpen && selectedNodeIds.length > 0;
    const showOverlayPanel = showDetailPanel || (isAiPanelOpen && !showDetailPanel);

    // Sync theme
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    // Adapt layout on resize: close overlays when switching to desktop side-panel mode
    React.useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            // Prefer list view on small screens if user hasn't set preference
            if (w < 768 && !localStorage.getItem("skillbridge_view_mode")) {
                useRoadmapStore.getState().setViewMode("list");
            }
            // Exit focus mode if it leaves panels unusable on tiny screens
            if (w < 640 && useRoadmapStore.getState().isFocusMode) {
                // keep focus mode but ensure detail still works as overlay
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // ESC closes overlay panels on mobile/tablet
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (isFocusMode) {
                setFocusMode(false);
                return;
            }
            if (showDetailPanel) closeDetailPanel();
            else if (isAiPanelOpen && window.innerWidth < 1024) toggleAiPanel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isFocusMode, showDetailPanel, isAiPanelOpen, setFocusMode, closeDetailPanel, toggleAiPanel]);

    return (
        <ReactFlowProvider>
            <div className="flex h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-background text-foreground">
                {/* Desktop sidebar (lg+ dock; md–lg also dock but narrower) */}
                {!isFocusMode && (
                    <div className="hidden h-full shrink-0 md:flex">
                        <Sidebar />
                    </div>
                )}

                {/* Mobile sidebar drawer (< md) */}
                {!isFocusMode && isSidebarOpen && (
                    <div className="fixed inset-0 z-[60] md:hidden">
                        <div
                            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
                            onClick={toggleSidebar}
                            aria-hidden
                        />
                        <div className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] max-w-full flex-col bg-background shadow-xl animate-in slide-in-from-left duration-300">
                            <Sidebar />
                        </div>
                    </div>
                )}

                {/* Main column — always min-w-0 to prevent flex blowout */}
                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-muted/10">
                        {children}
                    </main>
                </div>

                {/* Fullscreen overlays: phone + tablet (< lg) — and always in focus mode */}
                {showDetailPanel && (
                    <div
                        className={cn(
                            "fixed inset-0 z-[60] flex flex-col bg-background",
                            isFocusMode ? "" : "lg:hidden"
                        )}
                    >
                        <NodeDetailPanel />
                    </div>
                )}
                {isAiPanelOpen && !showDetailPanel && (
                    <div
                        className={cn(
                            "fixed inset-0 z-[60] flex flex-col bg-background",
                            isFocusMode ? "" : "lg:hidden"
                        )}
                    >
                        <ChatPanel />
                    </div>
                )}

                {/* Docked side panel: large desktop only (lg+) */}
                {!isFocusMode && (
                    <div
                        className={cn(
                            "relative hidden h-full shrink-0 overflow-hidden border-l bg-background transition-[width] duration-300 ease-in-out lg:block",
                            (isAiPanelOpen || showDetailPanel)
                                ? "w-80 xl:w-96"
                                : "w-0 border-transparent"
                        )}
                    >
                        {(isAiPanelOpen || showDetailPanel) && (
                            <div className="absolute inset-0 flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden">
                                {showDetailPanel ? (
                                    <NodeDetailPanel />
                                ) : isAiPanelOpen ? (
                                    <ChatPanel />
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile bottom safe spacer when overlay not open — thumb zone reserved via floating CTAs */}
                {!showOverlayPanel && <div className="pointer-events-none fixed inset-x-0 bottom-0 h-0 md:hidden" />}
            </div>
        </ReactFlowProvider>
    );
}
