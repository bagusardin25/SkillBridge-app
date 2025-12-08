import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

export function ChatPanel() {
    return (
        <div className="flex flex-col h-full border-l bg-background w-80">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="text-sm text-muted-foreground">
                    Chat history will appear here...
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form className="flex w-full items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
                    <Input type="text" placeholder="Ask AI..." />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
