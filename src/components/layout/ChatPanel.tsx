import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Sparkles, Trash2, Settings2, ChevronDown, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Square, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { generateRoadmap, createProject, extractTopicFromPrompt, saveChatMessage, getChatHistory, sendGeneralChatMessage, clearChatHistory } from "@/lib/api";
import type { RoadmapPreferences } from "@/lib/api";
import { convertToReactFlowNodes, isRoadmapRequest } from "@/lib/layoutUtils";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
    timestamp?: number;
    feedback?: "like" | "dislike" | null;
};

const SUGGESTIONS = [
    { icon: "🚀", text: "Buatkan roadmap React Developer" },
    { icon: "📚", text: "Jelaskan konsep System Design" },
    { icon: "🎯", text: "Bagaimana cara belajar Go?" },
];

const TYPING_SPEED = 15; // ms per character
const THINKING_DELAY = 800; // ms before starting to type

// Format timestamp
function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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
                                <CopyButton text={String(children)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
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
function CopyButton({ text, className }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "p-1.5 rounded-md bg-background/80 hover:bg-background border transition-all",
                            className
                        )}
                    >
                        {copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                        ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{copied ? "Copied!" : "Copy"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Typewriter component for streaming messages
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

// Default preferences
const defaultPreferences: RoadmapPreferences = {
    skillLevel: "beginner",
    learningTime: "moderate",
    learningStyle: "balanced",
    goal: "career",
};

export function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<RoadmapPreferences>(defaultPreferences);
    const [lastUserMessage, setLastUserMessage] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const {
        setNodes,
        setEdges,
        setProjectTitle,
        currentProjectId,
        setCurrentRoadmapId,
        setCurrentProject,
        contextualChatTopic,
        setContextualChatTopic,
    } = useRoadmapStore();
    const { user } = useAuthStore();
    const hasHandledTopic = useRef(false);
    const isCreatingProject = useRef(false);

    // Mark streaming message as complete
    const handleStreamingComplete = useCallback((messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ));
    }, []);

    // Handle feedback (like/dislike)
    const handleFeedback = useCallback((messageId: string, feedback: "like" | "dislike") => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
                : msg
        ));
    }, []);

    // Stop generation
    const handleStopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
    }, []);

    // Load chat history when project changes
    useEffect(() => {
        // Skip loading if we just created a new project from chat
        if (isCreatingProject.current) {
            isCreatingProject.current = false;
            return;
        }

        const loadChatHistory = async () => {
            if (!currentProjectId) {
                setMessages([]);
                return;
            }

            try {
                const data = await getChatHistory(currentProjectId);
                const loadedMessages: Message[] = data.messages.map((msg: { id: string; role: string; content: string }) => ({
                    id: msg.id,
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                    isStreaming: false,
                }));
                setMessages(loadedMessages);
            } catch (error) {
                console.error("Failed to load chat history:", error);
                setMessages([]);
            }
        };

        loadChatHistory();
    }, [currentProjectId]);

    // Handle contextual chat topic from node detail panel
    useEffect(() => {
        if (contextualChatTopic && !hasHandledTopic.current) {
            hasHandledTopic.current = true;
            const prompt = `Jelaskan lebih detail tentang "${contextualChatTopic}" dalam konteks roadmap pembelajaran. Apa saja yang perlu dipelajari dan bagaimana cara memulainya?`;
            setInputValue(prompt);
            // Clear the topic after setting
            setContextualChatTopic(null);
            // Reset the flag after a short delay
            setTimeout(() => {
                hasHandledTopic.current = false;
            }, 100);
        }
    }, [contextualChatTopic, setContextualChatTopic]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent, regenerateMessage?: string) => {
        e?.preventDefault();
        const messageToSend = regenerateMessage || inputValue.trim();
        if (!messageToSend) return;

        const userMessage = messageToSend;
        setLastUserMessage(userMessage);

        // Only add user message if not regenerating
        if (!regenerateMessage) {
            const newUserMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: userMessage,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, newUserMessage]);
        }

        setInputValue("");
        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            // Check if this is a roadmap generation request
            if (isRoadmapRequest(userMessage)) {
                let projectId = currentProjectId;

                // Auto-create project if none selected
                if (!projectId && user?.id) {
                    try {
                        const projectTitle = extractTopicFromPrompt(userMessage);
                        console.log("Creating project:", projectTitle, "for user:", user.id);
                        const newProject = await createProject(projectTitle, user.id);
                        console.log("Project created successfully:", newProject);
                        projectId = newProject.id;
                        isCreatingProject.current = true;
                        setCurrentProject(newProject.id, newProject.title);

                        // Use fresh callback from store to ensure we get the latest
                        const freshCallback = useRoadmapStore.getState().onProjectCreated;
                        if (freshCallback) {
                            console.log("Calling onProjectCreated callback");
                            freshCallback(newProject.id);
                        } else {
                            console.warn("onProjectCreated callback is not registered");
                        }

                        toast.success(`Project "${newProject.title}" dibuat!`);
                    } catch (projectError) {
                        console.error("Failed to create project:", projectError);
                        toast.error("Gagal membuat project. Chat akan dilanjutkan tanpa project.");
                        // Continue without project - user can still see the roadmap
                    }
                }

                // Save user message to DB
                if (projectId) {
                    saveChatMessage(projectId, "user", userMessage);
                }

                // Generate roadmap using AI (pass projectId and preferences to save to DB)
                const roadmap = await generateRoadmap(userMessage, projectId || undefined, preferences);

                // Check if AI returned a chat response instead of roadmap
                if ((roadmap as any).type === "chat") {
                    const chatMessage = (roadmap as any).message;
                    const messageId = (Date.now() + 1).toString();
                    const aiMessage: Message = {
                        id: messageId,
                        role: "assistant",
                        content: chatMessage,
                        isStreaming: true,
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, aiMessage]);

                    // Save to DB
                    if (projectId) {
                        saveChatMessage(projectId, "assistant", chatMessage);
                    }
                } else {
                    // Valid roadmap - render to canvas progressively
                    const { nodes, edges } = convertToReactFlowNodes(roadmap);

                    // Set project title first
                    setProjectTitle(roadmap.title);

                    // Track roadmap ID for future updates
                    if (roadmap.id) {
                        setCurrentRoadmapId(roadmap.id);
                    }

                    // Clear canvas first
                    setNodes([]);
                    setEdges([]);

                    // Progressive rendering - add nodes one by one
                    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                    const displayedNodes: typeof nodes = [];

                    for (let i = 0; i < nodes.length; i++) {
                        await delay(120); // 120ms delay between each node
                        displayedNodes.push(nodes[i]);
                        setNodes([...displayedNodes]);
                    }

                    // Add edges after all nodes are rendered
                    await delay(200);
                    setEdges(edges);

                    // Show success message with streaming effect
                    const messageId = (Date.now() + 1).toString();
                    const timeInfo = roadmap.totalEstimatedTime ? `\n⏱️ Estimasi waktu: ${roadmap.totalEstimatedTime}` : '';
                    const successMessageContent = `🎉 Roadmap "${roadmap.title}" berhasil dibuat!${timeInfo}\n\nRoadmap ini memiliki ${nodes.length} langkah pembelajaran. Klik pada setiap node untuk melihat detail dan sumber belajar.\n\nAda yang ingin kamu tanyakan tentang roadmap ini?`;
                    const successMessage: Message = {
                        id: messageId,
                        role: "assistant",
                        content: successMessageContent,
                        isStreaming: true,
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, successMessage]);

                    // Save success message to DB
                    if (projectId) {
                        saveChatMessage(projectId, "assistant", successMessageContent);
                    }
                }
            } else {
                // Regular chat - call chat API
                let projectId = currentProjectId;

                // Auto-create project if none selected
                if (!projectId && user?.id) {
                    try {
                        const projectTitle = extractTopicFromPrompt(userMessage);
                        console.log("Creating project for chat:", projectTitle, "for user:", user.id);
                        const newProject = await createProject(projectTitle, user.id);
                        console.log("Project created for chat successfully:", newProject);
                        projectId = newProject.id;
                        isCreatingProject.current = true;
                        setCurrentProject(newProject.id, newProject.title);

                        // Use fresh callback from store to ensure we get the latest
                        const freshCallback = useRoadmapStore.getState().onProjectCreated;
                        if (freshCallback) {
                            console.log("Calling onProjectCreated callback for chat");
                            freshCallback(newProject.id);
                        } else {
                            console.warn("onProjectCreated callback is not registered for chat");
                        }

                        toast.success(`Project "${newProject.title}" dibuat!`);
                    } catch (projectError) {
                        console.error("Failed to create project for chat:", projectError);
                        toast.error("Gagal membuat project. Chat akan dilanjutkan tanpa project.");
                        // Continue without project - user can still chat
                    }
                }

                const context = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                const data = await sendGeneralChatMessage(userMessage, projectId, context);

                const messageId = (Date.now() + 1).toString();
                const newAiMessage: Message = {
                    id: messageId,
                    role: "assistant",
                    content: data.reply,
                    isStreaming: true,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, newAiMessage]);
            }
        } catch (error) {
            // Don't show error if it was aborted
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            // Determine user-friendly error message
            let errorContent = "";

            if (error instanceof TypeError && error.message === "Failed to fetch") {
                errorContent = "🔌 **Tidak dapat terhubung ke server**\n\nKemungkinan penyebab:\n- Server backend belum dijalankan\n- Koneksi internet terputus\n\nSilakan coba lagi dalam beberapa saat.";
            } else if (error instanceof Error && (error.message.includes("rate limit") || error.message.includes("429"))) {
                errorContent = "⏳ **Server sedang sibuk**\n\nTerlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa detik dan coba lagi.";
            } else if (error instanceof Error && error.message.includes("unavailable")) {
                errorContent = "🔧 **Layanan AI sedang tidak tersedia**\n\nSilakan coba lagi dalam beberapa menit.";
            } else {
                errorContent = error instanceof Error
                    ? `❌ **Terjadi kesalahan**\n\n${error.message}\n\nSilakan coba lagi.`
                    : "❌ **Terjadi kesalahan**\n\nTidak dapat memproses permintaan. Silakan coba lagi.";
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: errorContent,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // Regenerate last response
    const handleRegenerate = () => {
        if (!lastUserMessage) return;
        // Remove last AI message
        setMessages(prev => {
            // Find last index of assistant message
            let lastIndex = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].role === "assistant") {
                    lastIndex = i;
                    break;
                }
            }
            if (lastIndex >= 0) {
                return prev.slice(0, lastIndex);
            }
            return prev;
        });
        // Resend last user message
        handleSendMessage(undefined, lastUserMessage);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        // Optional: auto-submit
        // handleSendMessage();
    };

    const clearChat = async () => {
        setMessages([]);
        if (currentProjectId) {
            try {
                await clearChatHistory(currentProjectId);
            } catch (error) {
                console.error("Failed to clear chat history:", error);
            }
        }
    };

    return (
        <div className="flex flex-col h-full border-l bg-background w-full md:w-80 shadow-xl">
            {/* Header */}
            <div className="h-14 px-4 border-b flex items-center justify-between bg-muted/10">
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
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={clearChat}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    {/* Close button - mobile only */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:hidden"
                        onClick={() => useRoadmapStore.getState().toggleAiPanel()}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center mt-6 space-y-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Welcome to SkillBridge!</h3>
                                <p className="text-xs text-muted-foreground px-4">
                                    I can help you build learning roadmaps. Try asking:
                                </p>
                            </div>

                            {/* Preferences Section */}
                            <div className="w-full px-2">
                                <button
                                    onClick={() => setShowPreferences(!showPreferences)}
                                    className="flex items-center justify-between w-full p-2.5 text-xs rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">Atur Preferensi Belajar</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground ml-5">Sesuaikan level & gaya belajarmu</span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-3.5 w-3.5 transition-transform duration-200",
                                        showPreferences && "rotate-180"
                                    )} />
                                </button>

                                <div className={cn(
                                    "grid transition-all duration-300 ease-out",
                                    showPreferences
                                        ? "grid-rows-[1fr] opacity-100 mt-2"
                                        : "grid-rows-[0fr] opacity-0 mt-0"
                                )}>
                                    <div className="overflow-hidden">
                                        <div className="p-3 border rounded-lg bg-card space-y-3 text-left">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Skill Level</label>
                                                <Select
                                                    value={preferences.skillLevel}
                                                    onValueChange={(v) => setPreferences({ ...preferences, skillLevel: v as RoadmapPreferences["skillLevel"] })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="beginner">Beginner (Pemula)</SelectItem>
                                                        <SelectItem value="intermediate">Intermediate (Menengah)</SelectItem>
                                                        <SelectItem value="advanced">Advanced (Mahir)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Learning Time</label>
                                                <Select
                                                    value={preferences.learningTime}
                                                    onValueChange={(v) => setPreferences({ ...preferences, learningTime: v as RoadmapPreferences["learningTime"] })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="casual">Casual (~1 jam/hari)</SelectItem>
                                                        <SelectItem value="moderate">Moderate (2-3 jam/hari)</SelectItem>
                                                        <SelectItem value="intensive">Intensive (4+ jam/hari)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Learning Style</label>
                                                <Select
                                                    value={preferences.learningStyle}
                                                    onValueChange={(v) => setPreferences({ ...preferences, learningStyle: v as RoadmapPreferences["learningStyle"] })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="theory">Theory First (Teori dulu)</SelectItem>
                                                        <SelectItem value="practice">Hands-on (Langsung praktek)</SelectItem>
                                                        <SelectItem value="balanced">Balanced (Seimbang)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-muted-foreground">Goal</label>
                                                <Select
                                                    value={preferences.goal}
                                                    onValueChange={(v) => setPreferences({ ...preferences, goal: v as RoadmapPreferences["goal"] })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="career">Career (Untuk kerja)</SelectItem>
                                                        <SelectItem value="project">Project (Untuk project)</SelectItem>
                                                        <SelectItem value="certification">Certification (Sertifikasi)</SelectItem>
                                                        <SelectItem value="hobby">Hobby (Just for fun)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full px-2 mt-4">
                                <div className="flex items-center gap-1.5 px-1 mb-1">
                                    <span className="text-sm">💡</span>
                                    <span className="text-[11px] font-medium text-muted-foreground">Mulai dengan pertanyaan:</span>
                                </div>
                                {SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion.text)}
                                        className="flex items-center gap-2.5 text-xs text-left p-3 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
                                    >
                                        <span className="text-base">{suggestion.icon}</span>
                                        <span>{suggestion.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            // Find last AI message index
                            let lastAiIndex = -1;
                            for (let i = messages.length - 1; i >= 0; i--) {
                                if (messages[i].role === "assistant") {
                                    lastAiIndex = i;
                                    break;
                                }
                            }
                            const isLastAiMessage = msg.role === "assistant" && index === lastAiIndex;

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[95%] group",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <Avatar className="h-8 w-8 border flex-shrink-0">
                                        {msg.role === "assistant" ? (
                                            <>
                                                <AvatarImage src="/bot-avatar.png" />
                                                <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                                            </>
                                        ) : (
                                            <>
                                                <AvatarImage src={user?.avatarUrl || ""} />
                                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || "ME"}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        {/* Timestamp */}
                                        {msg.timestamp && (
                                            <span className={cn(
                                                "text-[10px] text-muted-foreground",
                                                msg.role === "user" ? "text-right" : "text-left"
                                            )}>
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        )}

                                        <div
                                            className={cn(
                                                "rounded-lg p-3 text-sm shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                                                    : "bg-muted text-foreground"
                                            )}
                                        >
                                            {msg.isStreaming ? (
                                                <TypewriterText
                                                    text={msg.content}
                                                    onComplete={() => handleStreamingComplete(msg.id)}
                                                />
                                            ) : (
                                                msg.role === "assistant" ? (
                                                    <MarkdownContent content={msg.content} />
                                                ) : (
                                                    msg.content
                                                )
                                            )}
                                        </div>

                                        {/* Action buttons for AI messages */}
                                        {msg.role === "assistant" && !msg.isStreaming && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Copy */}
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p className="text-xs">Copy</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Regenerate - only on last AI message */}
                                                {isLastAiMessage && (
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={handleRegenerate}
                                                                    disabled={isLoading}
                                                                >
                                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p className="text-xs">Regenerate</p></TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}

                                                <div className="w-px h-4 bg-border mx-1" />

                                                {/* Like */}
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("h-7 w-7", msg.feedback === "like" && "text-green-500")}
                                                                onClick={() => handleFeedback(msg.id, "like")}
                                                            >
                                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p className="text-xs">Good response</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Dislike */}
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("h-7 w-7", msg.feedback === "dislike" && "text-red-500")}
                                                                onClick={() => handleFeedback(msg.id, "dislike")}
                                                            >
                                                                <ThumbsDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p className="text-xs">Bad response</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        onClick={handleStopGeneration}
                                    >
                                        <Square className="h-4 w-4" />
                                        <span className="sr-only">Stop</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">Stop generating</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
