import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { getNodeChatHistory, clearNodeChatHistory, streamChat, type ChatMessage } from "@/lib/api";
import { Sparkles, Send, Loader2, MessageSquare, AlertCircle, Trash2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAppLanguage } from "@/contexts/LanguageContext";



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

// Streaming cursor component
function StreamingCursor() {
    return <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-text-bottom rounded-sm" />;
}

interface NodeChatPanelProps {
    nodeId: string;
    topic: string;
    onExpand?: () => void;
}

export function NodeChatPanel({ nodeId, topic, onExpand }: NodeChatPanelProps) {
    const { currentProjectId } = useRoadmapStore();
    const { t, language } = useAppLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const suggestedQuestions = [
        t.fullScreenChat.suggestedQ1.replace("{topic}", topic),
        t.fullScreenChat.suggestedQ2.replace("{topic}", topic),
        t.fullScreenChat.suggestedQ4.replace("{topic}", topic),
        t.fullScreenChat.suggestedQ6.replace("{topic}", topic)
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
                content: `You are an AI tutor helping the user learn about "${topic}". Be concise and helpful. Answer in the same language the user uses. Format your responses with markdown for readability. ${language === "en" ? "ALWAYS respond in English." : "ALWAYS respond in Indonesian (Bahasa Indonesia)."}`,
            });

            // Create empty assistant message immediately
            const aiMessageId = `ai-${Date.now()}`;
            const aiMessage: ChatMessage = {
                id: aiMessageId,
                projectId: currentProjectId,
                nodeId,
                role: "assistant",
                content: "",
                createdAt: new Date().toISOString(),
            };
            setStreamingMessageId(aiMessageId);
            setMessages(prev => [...prev, aiMessage]);

            // Stream tokens
            abortControllerRef.current = new AbortController();
            await streamChat(
                { message: message.trim(), projectId: currentProjectId, nodeId, context, language },
                (token) => {
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === aiMessageId
                                ? { ...m, content: m.content + token }
                                : m
                        )
                    );
                },
                abortControllerRef.current.signal
            );

            // Mark streaming complete
            setStreamingMessageId(null);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            toast.error("Failed to get AI response");
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
            setIsSending(false);
            abortControllerRef.current = null;
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
                <p className="font-medium text-amber-700 dark:text-amber-400">{t.nodeChatPanel.notSaved}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    {t.nodeChatPanel.notSavedDesc}
                </p>
            </div>
        );
    }

    const handleClearChat = async () => {
        if (!currentProjectId) return;

        // Optimistically clear UI
        setMessages([]);

        // Persist to backend
        try {
            await clearNodeChatHistory(currentProjectId, nodeId);
        } catch (error) {
            console.error("Failed to clear node chat history:", error);
        }

        toast.success(t.fullScreenChat.chatCleared);
    };

    return (
        <div className="h-full flex flex-col w-full overflow-hidden">
            {/* Header bar with topic & clear button */}
            <div className="px-4 py-2 border-b flex items-center justify-between flex-shrink-0 bg-muted/5">
                <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate">{topic}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {messages.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            disabled={isSending}
                            title="Clear conversation"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                    )}
                    {onExpand && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onExpand}
                            className="h-7 w-7 text-muted-foreground hover:text-violet-600"
                            title="Expand to full screen"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollRef}>
                <div className="py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        // Empty state with suggested questions
                        <div className="flex flex-col h-full justify-center space-y-6 pb-8">
                            <div className="text-center">
                                <div className="h-12 w-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-200 dark:border-violet-800 shadow-sm rotate-3">
                                    <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h4 className="font-semibold text-lg px-2 break-words">{t.nodeChatPanel.askAiAbout}<br /> <span className="text-violet-600 dark:text-violet-400">{topic}</span></h4>
                                <p className="text-xs text-muted-foreground mt-2 max-w-[250px] mx-auto">
                                    {t.nodeChatPanel.getExplanation}
                                </p>
                            </div>

                            <div className="w-full">
                                <div className="flex items-center gap-1.5 px-1 mb-3 justify-center">
                                    <span className="text-xs">💡</span>
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{t.nodeChatPanel.trySuggestions}</span>
                                </div>
                                <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
                                    {suggestedQuestions.map((question, i) => (
                                        <button
                                            key={i}
                                            className="flex items-center gap-3 text-xs text-left p-3 rounded-xl border bg-card hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-800 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group active:scale-[0.98]"
                                            onClick={() => handleSend(question)}
                                            disabled={isSending}
                                        >
                                            <div className="h-7 w-7 rounded-lg bg-violet-100/50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <MessageSquare className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <span className="font-medium text-foreground/80 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2">
                                                {question}
                                            </span>
                                        </button>
                                    ))}
                                </div>
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
                                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${message.role === "user"
                                            ? "bg-primary text-primary-foreground border-primary rounded-tr-sm"
                                            : "bg-background/60 backdrop-blur-md dark:bg-background/40 text-foreground border-violet-200/50 dark:border-violet-800/50 rounded-tl-sm ring-1 ring-violet-500/10 dark:ring-violet-400/10 shadow-[0_2px_10px_-3px_rgba(139,92,246,0.1)]"
                                            }`}
                                    >
                                        {message.role === "user" ? (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        ) : isStreaming ? (
                                            <>
                                                <MarkdownContent content={message.content} />
                                                <StreamingCursor />
                                            </>
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
                        placeholder={`${language === "en" ? "Ask about" : "Tanya tentang"} ${topic}...`}
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
