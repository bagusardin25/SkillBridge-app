import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { getNodeChatHistory, sendNodeChatMessage, type ChatMessage } from "@/lib/api";
import { Sparkles, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const TYPING_SPEED = 15; // ms per character
const THINKING_DELAY = 500; // ms before starting to type

// Markdown renderer with syntax highlighting
function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
            <ReactMarkdown
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;

                        if (isInline) {
                            return (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <div className="relative group my-2">
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// Typewriter component for streaming AI responses
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let charIndex = 0;
        setDisplayedText("");

        // Start typing after thinking delay
        const delayTimer = setTimeout(() => {
            const typeInterval = setInterval(() => {
                if (charIndex < text.length) {
                    setDisplayedText(text.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    onComplete?.();
                }
            }, TYPING_SPEED);

            return () => clearInterval(typeInterval);
        }, THINKING_DELAY);

        return () => clearTimeout(delayTimer);
    }, [text, onComplete]);

    return <>{displayedText}<span className="animate-pulse">|</span></>;
}

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
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mark streaming message as complete
    const handleStreamingComplete = useCallback((messageId: string) => {
        if (streamingMessageId === messageId) {
            setStreamingMessageId(null);
        }
    }, [streamingMessageId]);

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

            // Set this message as streaming before adding
            setStreamingMessageId(aiMessage.id);
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
                                <h4 className="font-medium break-words">Ask AI about {topic}</h4>
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
                                        className="w-full justify-start text-left h-auto py-2 text-xs whitespace-normal"
                                        onClick={() => handleSend(question)}
                                        disabled={isSending}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                        <span className="break-words">{question}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Chat messages
                        messages.map((message) => {
                            const isStreaming = message.id === streamingMessageId;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}
                                    >
                                        {message.role === "user" ? (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        ) : isStreaming ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <TypewriterText
                                                    text={message.content}
                                                    onComplete={() => handleStreamingComplete(message.id)}
                                                />
                                            </div>
                                        ) : (
                                            <MarkdownContent content={message.content} />
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
