import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";
import { Header } from "./Header";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ReactFlowProvider } from "@xyflow/react";
import { useRoadmapStore } from "@/store/useRoadmapStore";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAiPanelOpen, isSidebarOpen } = useRoadmapStore();

    return (
        <ReactFlowProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                {/* Left Sidebar - Projects Only - Collapsible */}
                <div
                    className={`
            hidden md:flex flex-col border-r h-full
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"}
          `}
                >
                    {isSidebarOpen && (
                        <Sidebar className="flex-1 overflow-y-auto no-scrollbar" />
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <Header />
                    <main className="flex-1 overflow-hidden relative bg-muted/10">
                        {children}
                    </main>
                    {/* Floating Bottom Toolbar */}
                    <BottomToolbar />
                </div>

                {/* Right Chat Panel - Collapsible */}
                <div
                    className={`
            transition-all duration-300 ease-in-out border-l
            ${isAiPanelOpen ? "w-80" : "w-0 overflow-hidden border-l-0"}
          `}
                >
                    {isAiPanelOpen && <ChatPanel />}
                </div>
            </div>
        </ReactFlowProvider>
    );
}
