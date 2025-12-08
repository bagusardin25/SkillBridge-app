import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar className="hidden md:flex" />
            <main className="flex-1 overflow-hidden relative bg-muted/10 flex flex-col">
                {children}
            </main>
            <ChatPanel />
        </div>
    );
}
