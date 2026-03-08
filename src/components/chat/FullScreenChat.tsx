import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { getNodeChatHistory, sendNodeChatMessage, clearNodeChatHistory, type ChatMessage } from "@/lib/api";
import {
    Sparkles,
    Send,
    Loader2,
    MessageSquare,
    X,
    Trash2,
    ExternalLink,
    BookOpen,
    CheckCircle2,
    Minimize2,
    Lightbulb,
    Copy,
    Check,
    RefreshCw,
    ChevronDown,
    User,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

const THINKING_DELAY = 500;

// Format relative timestamp
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}j lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// Markdown renderer with syntax highlighting
function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline">
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
                            <div className="relative group my-3">
                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 rounded-t-lg border-b border-zinc-700">
                                    <span className="text-xs text-zinc-400 font-mono">{match[1]}</span>
                                    <CopyButton text={String(children)} label />
                                </div>
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderTopLeftRadius: 0,
                                        borderTopRightRadius: 0,
                                        borderBottomLeftRadius: '0.5rem',
                                        borderBottomRightRadius: '0.5rem',
                                        fontSize: '0.8rem',
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

// Copy button component
function CopyButton({ text, className, label }: { text: string; className?: string; label?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                copied ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200",
                className
            )}
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {label && <span>{copied ? "Copied!" : "Copy"}</span>}
        </button>
    );
}

// Typewriter component for streaming AI responses
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let charIndex = 0;
        setDisplayedText("");

        const delayTimer = setTimeout(() => {
            const typeText = () => {
                if (charIndex < text.length) {
                    const chunkSize = Math.max(1, Math.floor(text.length / 50));
                    charIndex = Math.min(text.length, charIndex + chunkSize);
                    setDisplayedText(text.slice(0, charIndex));

                    if (charIndex < text.length) {
                        setTimeout(typeText, Math.random() * 10 + 5);
                    } else {
                        onComplete?.();
                    }
                }
            };
            typeText();
        }, THINKING_DELAY);

        return () => clearTimeout(delayTimer);
    }, [text, onComplete]);

    return <>{displayedText}<span className="animate-pulse">|</span></>;
}

// Detect resource type from URL
function getResourceType(url: string): { type: string; color: string } {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("video")) {
        return { type: "Video", color: "bg-rose-500 text-white" };
    }
    if (lowerUrl.includes("reddit") || lowerUrl.includes("feed") || lowerUrl.includes("forum")) {
        return { type: "Feed", color: "bg-orange-500 text-white" };
    }
    if (lowerUrl.includes("roadmap.sh")) {
        return { type: "Roadmap", color: "bg-violet-600 text-white" };
    }
    return { type: "Article", color: "bg-slate-700 text-white" };
}

// Extract readable name from URL
function getResourceName(url: string): string {
    try {
        const urlObj = new URL(url);
        let name = urlObj.pathname.split("/").filter(Boolean).pop() || urlObj.hostname;
        name = name.replace(/[-_]/g, " ").replace(/\.(html|htm|php|aspx)$/i, "");
        return name.split(" ").map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ") || urlObj.hostname;
    } catch {
        return url;
    }
}

// Message action buttons component (shown on hover)
function MessageActions({
    message,
    isLastAi,
    onRegenerate,
    isSending,
}: {
    message: ChatMessage;
    isLastAi: boolean;
    onRegenerate: () => void;
    isSending: boolean;
}) {
    return (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CopyButton
                text={message.content}
                className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            />
            {isLastAi && (
                <button
                    onClick={onRegenerate}
                    disabled={isSending}
                    className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title="Regenerate response"
                >
                    <RefreshCw className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

interface FullScreenChatProps {
    nodeId: string;
    topic: string;
    description?: string;
    resources?: string[];
    videos?: (string | { url: string; title: string; thumbnail: string; channelTitle?: string })[];
    category?: string;
    isCompleted?: boolean;
    onClose: () => void;
}

export function FullScreenChat({
    nodeId,
    topic,
    description,
    resources = [],
    videos = [],
    category,
    isCompleted,
    onClose,
}: FullScreenChatProps) {
    const { currentProjectId } = useRoadmapStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleStreamingComplete = useCallback((messageId: string) => {
        if (streamingMessageId === messageId) {
            setStreamingMessageId(null);
        }
    }, [streamingMessageId]);

    const suggestedQuestions = [
        `Apa itu ${topic}?`,
        `Gimana cara mulai belajar ${topic}?`,
        `Berikan contoh kode untuk ${topic}`,
        `Kesalahan pemula saat belajar ${topic}?`,
        `Best practices untuk ${topic}?`,
        `Topik selanjutnya setelah ${topic}?`,
    ];

    // All resources combined
    const allResources = [
        ...resources.map(r => ({ url: r, type: 'resource' as const, title: getResourceName(r), thumbnail: null as string | null })),
        ...videos.map(v => {
            if (typeof v === 'object' && v !== null) {
                return { url: v.url, type: 'video' as const, title: v.title, thumbnail: v.thumbnail, channelTitle: v.channelTitle };
            }
            return { url: v, type: 'video' as const, title: getResourceName(v), thumbnail: null as string | null };
        }),
    ];

    // Welcome message
    const welcomeMessage: ChatMessage = {
        id: "welcome",
        projectId: currentProjectId || "",
        nodeId,
        role: "assistant",
        content: `Hai! 👋 Aku AI Tutor-mu untuk topik **${topic}**.\n\n${description ? `${description}\n\n` : ''}Aku siap membantu kamu memahami materi ini. Kamu bisa:\n- Bertanya apa saja tentang topik ini\n- Minta contoh kode atau penjelasan\n- Diskusi tentang konsep yang belum dipahami\n\nMau mulai dari mana? 😊`,
        createdAt: new Date().toISOString(),
    };

    // Load chat history
    useEffect(() => {
        const loadHistory = async () => {
            if (!currentProjectId) return;
            setIsLoading(true);
            try {
                const data = await getNodeChatHistory(currentProjectId, nodeId);
                if (data.messages.length > 0) {
                    setMessages(data.messages);
                } else {
                    // Show welcome message for empty chats
                    setMessages([welcomeMessage]);
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
                setMessages([welcomeMessage]);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProjectId, nodeId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus textarea on mount
    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 300);
    }, []);

    // Track scroll position for scroll-to-bottom FAB
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
        setShowScrollBtn(distanceFromBottom > 200);
    }, []);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Reset height to auto to recalculate
        e.target.style.height = "auto";
        // Set to scrollHeight (capped at ~6 lines = 144px)
        e.target.style.height = Math.min(e.target.scrollHeight, 144) + "px";
    };

    const handleSend = async (message: string) => {
        if (!message.trim() || !currentProjectId || isSending) return;

        setLastUserMessage(message.trim());

        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            projectId: currentProjectId,
            nodeId,
            role: "user",
            content: message.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => {
            // Remove welcome message if it exists and this is the first real message
            const filtered = prev.filter(m => m.id !== "welcome");
            return [...filtered, userMessage];
        });
        setInput("");
        setIsSending(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const context: { role: string; content: string }[] = messages
                .filter(m => m.id !== "welcome")
                .slice(-6)
                .map(m => ({
                    role: m.role,
                    content: m.content,
                }));

            context.unshift({
                role: "system",
                content: `You are an AI tutor helping the user learn about "${topic}". ${description ? `Context: ${description}` : ''} Be concise and helpful. Use code examples when relevant. Answer in the same language the user uses. Format your responses with markdown for readability.`,
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

            setStreamingMessageId(aiMessage.id);
            setMessages(prev => [...prev, aiMessage]);
        } catch {
            toast.error("Gagal mendapatkan respons AI");
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
            setIsSending(false);
            // Re-focus textarea
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    // Regenerate last AI response
    const handleRegenerate = () => {
        if (!lastUserMessage || isSending) return;
        // Remove last AI message
        setMessages(prev => {
            const lastAiIdx = [...prev].reverse().findIndex(m => m.role === "assistant");
            if (lastAiIdx >= 0) {
                return prev.slice(0, prev.length - 1 - lastAiIdx + (lastAiIdx > 0 ? lastAiIdx : 0));
            }
            return prev;
        });
        handleSend(lastUserMessage);
    };

    const handleClearChat = async () => {
        if (!currentProjectId) return;
        setMessages([welcomeMessage]);
        setLastUserMessage("");
        try {
            await clearNodeChatHistory(currentProjectId, nodeId);
        } catch (error) {
            console.error("Failed to clear node chat history:", error);
        }
        toast.success("Riwayat percakapan dibersihkan");
    };

    const categoryLabels: Record<string, { label: string; color: string }> = {
        core: { label: "Core", color: "bg-primary text-primary-foreground" },
        optional: { label: "Optional", color: "bg-slate-500 text-white" },
        advanced: { label: "Advanced", color: "bg-violet-500 text-white" },
        project: { label: "Project", color: "bg-emerald-500 text-white" },
    };

    const cat = category ? categoryLabels[category] : null;

    // Find last AI message index
    const lastAiIndex = (() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant" && messages[i].id !== "welcome") return i;
        }
        return -1;
    })();

    // Check if only welcome message exists
    const hasRealMessages = messages.some(m => m.id !== "welcome");

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="h-14 px-4 border-b flex items-center justify-between bg-muted/10 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold leading-none truncate">AI Tutor</h1>
                        <span className="text-[10px] text-muted-foreground truncate block">{topic}</span>
                    </div>
                    {cat && (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${cat.color} flex-shrink-0 hidden sm:inline`}>
                            {cat.label}
                        </span>
                    )}
                    {isCompleted && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 flex-shrink-0 hidden sm:flex">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Done</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {hasRealMessages && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            className="h-8 text-xs text-muted-foreground hover:text-destructive"
                            disabled={isSending}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Clear</span>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 text-xs text-muted-foreground gap-1"
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Minimize</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content: Sidebar + Chat */}
            <div className="flex-1 flex overflow-hidden">
                {/* Context Sidebar - Hidden on mobile */}
                <div className="hidden md:flex w-72 border-r flex-col flex-shrink-0 bg-muted/5">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-5">
                            {/* Topic Info */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold leading-tight">{topic}</h3>
                                {description && (
                                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                                )}
                            </div>

                            {/* Resources */}
                            {allResources.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Resources</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {allResources.map((r, i) => {
                                            const info = getResourceType(r.url);
                                            const isVideo = r.type === 'video';

                                            return (
                                                <a
                                                    key={i}
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block rounded-lg hover:bg-muted/50 transition-colors group overflow-hidden"
                                                >
                                                    {/* Show mini thumbnail for videos */}
                                                    {isVideo && r.thumbnail && (
                                                        <div className="relative w-full aspect-video bg-muted rounded-t-lg overflow-hidden">
                                                            <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center">
                                                                    <svg className="h-3.5 w-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 p-2">
                                                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${info.color}`}>
                                                            {info.type}
                                                        </span>
                                                        <span className="truncate text-xs text-foreground/80 group-hover:text-foreground flex-1">{r.title}</span>
                                                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quick Questions */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Quick Questions</span>
                                </div>
                                <div className="space-y-1">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(q)}
                                            disabled={isSending}
                                            className="w-full text-left text-[11px] p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 text-muted-foreground transition-colors leading-snug disabled:opacity-50"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <ScrollArea className="flex-1 px-4" onScrollCapture={handleScroll}>
                        <div className="max-w-3xl mx-auto py-6 space-y-5">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                                        <span className="text-sm text-muted-foreground">Memuat riwayat chat...</span>
                                    </div>
                                </div>
                            ) : (
                                /* Chat messages with avatars */
                                messages.map((message, index) => {
                                    const isAi = message.role === "assistant";
                                    const isStreaming = message.id === streamingMessageId;
                                    const isWelcome = message.id === "welcome";
                                    const isLastAiMsg = index === lastAiIndex;

                                    return (
                                        <div key={message.id} className="group">
                                            <div className={cn(
                                                "flex gap-3",
                                                !isAi && "flex-row-reverse"
                                            )}>
                                                {/* Avatar */}
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                                    isAi
                                                        ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm"
                                                        : "bg-muted border"
                                                )}>
                                                    {isAi ? (
                                                        <Sparkles className="h-4 w-4 text-white" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Message content */}
                                                <div className={cn(
                                                    "flex flex-col gap-1 min-w-0",
                                                    !isAi && "items-end"
                                                )}>
                                                    {/* Name + Timestamp */}
                                                    <div className={cn(
                                                        "flex items-center gap-2",
                                                        !isAi && "flex-row-reverse"
                                                    )}>
                                                        <span className="text-xs font-semibold">
                                                            {isAi ? "AI Tutor" : "Kamu"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {isWelcome ? "" : formatRelativeTime(message.createdAt)}
                                                        </span>
                                                    </div>

                                                    {/* Bubble */}
                                                    <div
                                                        className={cn(
                                                            "rounded-2xl px-4 py-3 text-sm shadow-sm border max-w-[90%]",
                                                            isAi
                                                                ? "bg-card text-foreground border-border/50 rounded-tl-sm"
                                                                : "bg-primary text-primary-foreground border-primary rounded-tr-sm"
                                                        )}
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

                                                    {/* Message Actions (hover) — only for non-welcome AI messages */}
                                                    {isAi && !isWelcome && !isStreaming && (
                                                        <MessageActions
                                                            message={message}
                                                            isLastAi={isLastAiMsg}
                                                            onRegenerate={handleRegenerate}
                                                            isSending={isSending}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* Typing indicator */}
                            {isSending && (
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold">AI Tutor</span>
                                        <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 border shadow-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                <span className="text-xs text-muted-foreground ml-2">Sedang mengetik...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggested questions inline (only for welcome/empty state on mobile) */}
                            {!hasRealMessages && !isLoading && (
                                <div className="md:hidden">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Coba tanyakan</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {suggestedQuestions.slice(0, 4).map((question, i) => (
                                            <button
                                                key={i}
                                                className="flex items-center gap-2.5 text-xs text-left p-3 rounded-xl border bg-card hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-800 shadow-sm hover:shadow-md transition-all duration-300 group active:scale-[0.98]"
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
                            )}

                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    {/* Scroll to bottom FAB */}
                    {showScrollBtn && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-24 right-6 h-9 w-9 rounded-full bg-card border shadow-lg flex items-center justify-center hover:bg-muted transition-colors animate-in fade-in slide-in-from-bottom-2 duration-200"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    )}

                    {/* Input Area */}
                    <div className="border-t p-4 flex-shrink-0 bg-background">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={handleTextareaChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Tanya tentang ${topic}...`}
                                        disabled={isSending}
                                        rows={1}
                                        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[144px] overflow-y-auto"
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || isSending}
                                    className="h-11 w-11 rounded-xl flex-shrink-0"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Enter</kbd> kirim · <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Shift+Enter</kbd> baris baru
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
