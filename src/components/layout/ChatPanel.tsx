import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Sparkles, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

const SUGGESTIONS = [
    "Create a roadmap for React Developer",
    "Explain System Design concepts",
    "How to learn Go from scratch?",
];

export function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        // Call real AI API
        try {
            const response = await fetch("http://localhost:3001/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: inputValue,
                    context: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const newAiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.reply,
                };
                setMessages((prev) => [...prev, newAiMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `Error: ${data.error || "Failed to get response"}`,
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Failed to connect to server. Make sure the backend is running on port 3001.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        // Optional: auto-submit
        // handleSendMessage();
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col h-full border-l bg-background w-80 shadow-xl">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold leading-none">AI Assistant</h2>
                        <span className="text-[10px] text-muted-foreground">Powered by SkillBridge</span>
                    </div>
                </div>
                {messages.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={clearChat}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center mt-10 space-y-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Welcome to SkillBridge!</h3>
                                <p className="text-xs text-muted-foreground px-4">
                                    I can help you build learning roadmaps. Try asking:
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 w-full px-2 mt-4">
                                {SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs text-left p-2.5 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 max-w-[90%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <Avatar className="h-8 w-8 border">
                                    {msg.role === "assistant" ? (
                                        <>
                                            <AvatarImage src="/bot-avatar.png" />
                                            <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                                        </>
                                    ) : (
                                        <>
                                            <AvatarImage src="/user-avatar.png" />
                                            <AvatarFallback>You</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div
                                    className={cn(
                                        "rounded-lg p-3 text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-3 max-w-[90%]">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-3 flex items-center gap-1 h-10">
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form className="flex w-full items-end gap-2" onSubmit={handleSendMessage}>
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 min-h-[40px]"
                        placeholder="Type a message..."
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
