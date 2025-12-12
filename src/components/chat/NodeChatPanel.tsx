import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { getNodeChatHistory, sendNodeChatMessage, type ChatMessage } from "@/lib/api";
import { Sparkles, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NodeChatPanelProps {
    nodeId: string;
    topic: string;
}

export function NodeChatPanel({ nodeId, topic }: NodeChatPanelProps) {
    const { currentProjectId } = useRoadmapStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const suggestedQuestions = [
        `What is ${topic} and why is it important?`,
        `How do I get started with ${topic}?`,
        `What are common mistakes when learning ${topic}?`,
        `What should I learn after ${topic}?`
    ];

    // Load chat history when component mounts or nodeId changes
    useEffect(() => {
        const loadHistory = async () => {
            if (!currentProjectId) return;
            
            setIsLoading(true);
            try {
                const data = await getNodeChatHistory(currentProjectId, nodeId);
                setMessages(data.messages);
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [currentProjectId, nodeId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (message: string) => {
        if (!message.trim() || !currentProjectId || isSending) return;

        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            projectId: currentProjectId,
            nodeId,
            role: "user",
            content: message.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsSending(true);

        try {
            // Build context from recent messages
            const context: { role: string; content: string }[] = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content,
            }));

            // Add system context about the topic
            context.unshift({
                role: "system",
                content: `You are an AI tutor helping the user learn about "${topic}". Be concise and helpful. Answer in the same language the user uses.`,
            });

            const { reply } = await sendNodeChatMessage(
                currentProjectId,
                nodeId,
                message.trim(),
                context
            );

            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                projectId: currentProjectId,
                nodeId,
                role: "assistant",
                content: reply,
                createdAt: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            toast.error("Failed to get AI response");
            // Remove the user message if failed
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    // Show warning if project not saved
    if (!currentProjectId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                <p className="font-medium text-amber-700 dark:text-amber-400">Roadmap Belum Disimpan</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Simpan roadmap terlebih dahulu (Ctrl+S) untuk menggunakan AI Tutor.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                <div className="py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        // Empty state with suggested questions
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                                <h4 className="font-medium">Ask AI about {topic}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Get personalized explanations and guidance.
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
                                {suggestedQuestions.map((question, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left h-auto py-2 text-xs"
                                        onClick={() => handleSend(question)}
                                        disabled={isSending}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                        <span className="line-clamp-2">{question}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Chat messages
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Typing indicator */}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-3 py-2">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about ${topic}...`}
                        disabled={isSending}
                        className="flex-1"
                    />
                    <Button
                        size="icon"
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isSending}
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
