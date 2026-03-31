import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Sparkles, Trash2, Settings2, ChevronDown, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Square, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { generateRoadmap, createProject, extractTopicFromPrompt, saveChatMessage, getChatHistory, clearChatHistory, getRoadmap, streamChat } from "@/lib/api";
import type { RoadmapPreferences } from "@/lib/api";
import { convertToReactFlowNodes, isRoadmapRequest } from "@/lib/layoutUtils";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useAppLanguage } from "@/contexts/LanguageContext";
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

import { Rocket, FileText, Target } from "lucide-react";


// Suggestions are now dynamic based on language, defined inside the component


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

// Streaming cursor component — shows pulsing cursor during active streaming
function StreamingCursor() {
    return <span className="inline-block w-2 h-4 bg-foreground/60 animate-pulse ml-0.5 align-text-bottom" />;
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
        incrementProjectsVersion,
    } = useRoadmapStore();
    const { user } = useAuthStore();
    const { t, language } = useAppLanguage();
    const hasHandledTopic = useRef(false);
    const isCreatingProject = useRef(false);



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
            const prompt = t.chat.contextualPrompt.replace("{topic}", contextualChatTopic);
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

                        toast.success(t.toasts.projectCreatedName.replace("{title}", newProject.title));
                        // Trigger sidebar refresh via version counter
                        incrementProjectsVersion();
                    } catch (projectError) {
                        console.error("Failed to create project:", projectError);
                        toast.error(t.toasts.projectCreateFailed);
                        // Continue without project - user can still see the roadmap
                    }
                }

                // Save user message to DB
                if (projectId) {
                    saveChatMessage(projectId, "user", userMessage);
                }

                // Show Skeleton Graph in Canvas while AI is generating
                setNodes([
                    { id: 'skel-1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Analyzing Topic...', description: '', resources: [] }, className: 'animate-pulse opacity-70 border-primary/50 pointer-events-none' },
                    { id: 'skel-2', type: 'default', position: { x: 0, y: 200 }, data: { label: 'Gathering Resources...', description: '', resources: [] }, className: 'animate-pulse opacity-40 border-primary/30 pointer-events-none' },
                    { id: 'skel-3', type: 'default', position: { x: 0, y: 400 }, data: { label: 'Structuring Path...', description: '', resources: [] }, className: 'animate-pulse opacity-20 border-primary/10 pointer-events-none' },
                ]);
                setEdges([
                    { id: 'skel-e1', source: 'skel-1', target: 'skel-2', animated: true, style: { strokeOpacity: 0.5 } },
                    { id: 'skel-e2', source: 'skel-2', target: 'skel-3', animated: true, style: { strokeOpacity: 0.2 } },
                ]);

                // Generate roadmap using AI (pass projectId and preferences to save to DB)
                const roadmap = await generateRoadmap(userMessage, projectId || undefined, preferences, language);

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

                    // Progressive rendering — nodes AND edges appear together
                    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                    const displayedNodes: typeof nodes = [];
                    const displayedEdges: typeof edges = [];

                    for (let i = 0; i < nodes.length; i++) {
                        await delay(150); // 150ms delay for premium live-generation feel
                        displayedNodes.push(nodes[i]);

                        // Add the edge connecting to this node (edge i-1 connects node i-1 → node i)
                        if (i > 0 && edges[i - 1]) {
                            displayedEdges.push(edges[i - 1]);
                        }

                        setNodes([...displayedNodes]);
                        setEdges([...displayedEdges]);
                    }

                    // Poll for enriched resources with retry (background enrichment may take varying time)
                    if (roadmap.id) {
                        const enrichRoadmapId = roadmap.id;
                        const pollDelays = [5000, 10000, 15000]; // 5s, 10s, 15s

                        (async () => {
                            for (const delay of pollDelays) {
                                await new Promise(r => setTimeout(r, delay));
                                try {
                                    const enrichedRoadmap = await getRoadmap(enrichRoadmapId);
                                    if (enrichedRoadmap.nodes && Array.isArray(enrichedRoadmap.nodes)) {
                                        const hasVideos = (enrichedRoadmap.nodes as any[]).some(
                                            (n: any) => n.data?.videos && n.data.videos.length > 0
                                        );
                                        if (hasVideos) {
                                            const currentNodes = useRoadmapStore.getState().nodes;
                                            const updatedNodes = currentNodes.map(node => {
                                                const enrichedNode = (enrichedRoadmap.nodes as any[]).find(
                                                    (n: any) => n.id === node.id
                                                );
                                                if (enrichedNode?.data) {
                                                    return {
                                                        ...node,
                                                        data: {
                                                            ...node.data,
                                                            videos: enrichedNode.data.videos || node.data.videos || [],
                                                            articles: enrichedNode.data.articles || node.data.articles || [],
                                                            resources: enrichedNode.data.resources || node.data.resources || [],
                                                        },
                                                    };
                                                }
                                                return node;
                                            });
                                            setNodes(updatedNodes as any);
                                            console.log("✅ Enriched resources loaded from DB");
                                            break; // Stop polling — enrichment complete
                                        }
                                        console.log(`⏳ Enrichment not ready yet, retrying in ${delay / 1000}s...`);
                                    }
                                } catch (e) {
                                    console.warn("Failed to fetch enriched resources:", e);
                                }
                            }
                        })();
                    }

                    // Show success message with streaming effect
                    const messageId = (Date.now() + 1).toString();
                    const timeInfo = roadmap.totalEstimatedTime ? `\n⏱️ ${roadmap.totalEstimatedTime}` : '';
                    const successMessageContent = `${t.chat.roadmapCreated.replace("{title}", roadmap.title)}${timeInfo}\n\n${t.chat.roadmapCreatedBody.replace("{count}", String(nodes.length))}\n\n${t.chat.askAboutRoadmap}`;
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
                // Regular chat — use streaming
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

                        const freshCallback = useRoadmapStore.getState().onProjectCreated;
                        if (freshCallback) {
                            freshCallback(newProject.id);
                        }

                        toast.success(t.toasts.projectCreatedName.replace("{title}", newProject.title));
                        incrementProjectsVersion();
                    } catch (projectError) {
                        console.error("Failed to create project for chat:", projectError);
                        toast.error(t.toasts.projectCreateFailed);
                    }
                }

                const context = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                // Create empty assistant message immediately
                const messageId = (Date.now() + 1).toString();
                const newAiMessage: Message = {
                    id: messageId,
                    role: "assistant",
                    content: "",
                    isStreaming: true,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, newAiMessage]);

                // Stream tokens into the message
                await streamChat(
                    { message: userMessage, projectId, context, language },
                    (token) => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === messageId
                                    ? { ...msg, content: msg.content + token }
                                    : msg
                            )
                        );
                    },
                    abortControllerRef.current?.signal
                );

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === messageId ? { ...msg, isStreaming: false } : msg
                    )
                );

                // Save the complete message to DB (streaming endpoint already saves it)
            }
        } catch (error) {
            // Don't show error if it was aborted
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            // Determine user-friendly error message
            let errorContent = "";

            if (error instanceof TypeError && error.message === "Failed to fetch") {
                errorContent = `${t.chat.errorNoConnection}\n\n${t.chat.errorNoConnectionDesc}`;
            } else if (error instanceof Error && (error.message.includes("rate limit") || error.message.includes("429"))) {
                errorContent = `${t.chat.errorRateLimit}\n\n${t.chat.errorRateLimitDesc}`;
            } else if (error instanceof Error && error.message.includes("unavailable")) {
                errorContent = `${t.chat.errorUnavailable}\n\n${t.chat.errorUnavailableDesc}`;
            } else {
                errorContent = error instanceof Error
                    ? `${t.chat.errorGeneric}\n\n${error.message}\n\n${t.chat.errorGenericDesc}`
                    : `${t.chat.errorGeneric}\n\n${t.chat.errorGenericDesc}`;
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
        <div className="flex flex-col h-full bg-background w-full">
            {/* Header */}
            <div className="h-14 px-4 border-b flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-black dark:bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-sm">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background"></span>
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold leading-none">{t.chat.aiAssistant}</h2>
                        <span className="text-[10px] text-muted-foreground">{t.chat.poweredBy}</span>
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
                                <h3 className="text-sm font-medium">{t.chat.welcome}</h3>
                                <p className="text-xs text-muted-foreground px-4">
                                    {t.chat.welcomeHint}
                                </p>
                            </div>

                            {/* Preferences Section */}
                            <div className="w-full px-2 max-w-md mx-auto">
                                <button
                                    onClick={() => setShowPreferences(!showPreferences)}
                                    className={cn(
                                        "flex items-center justify-between w-full p-3 text-xs rounded-xl border transition-all duration-300",
                                        showPreferences
                                            ? "bg-card border-primary/20 shadow-sm"
                                            : "border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">{t.chat.setPreferences}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground ml-5">{t.chat.customizePreferences}</span>
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
                                        <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm space-y-5 text-left">

                                            {/* Skill Level - Radio Group Style */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                                                    <span className="h-4 w-1 bg-primary/40 rounded-full" /> {t.chat.skillLevel}
                                                </label>
                                                <div className="grid grid-cols-3 gap-1.5 bg-muted/50 p-1 rounded-lg">
                                                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setPreferences({ ...preferences, skillLevel: level })}
                                                            className={cn(
                                                                "py-1.5 px-2 text-[10px] md:text-xs font-medium rounded-md transition-all",
                                                                preferences.skillLevel === level
                                                                    ? "bg-background shadow-sm text-foreground"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                            )}
                                                        >
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Learning Style - Radio Group Style */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                                                    <span className="h-4 w-1 bg-blue-500/40 rounded-full" /> {t.chat.learningStyle}
                                                </label>
                                                <div className="grid grid-cols-3 gap-1.5 bg-muted/50 p-1 rounded-lg">
                                                    {(['theory', 'balanced', 'practice'] as const).map((style) => (
                                                        <button
                                                            key={style}
                                                            onClick={() => setPreferences({ ...preferences, learningStyle: style })}
                                                            className={cn(
                                                                "py-1.5 px-2 text-[10px] md:text-xs font-medium rounded-md transition-all",
                                                                preferences.learningStyle === style
                                                                    ? "bg-background shadow-sm text-foreground"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                            )}
                                                        >
                                                            {style.charAt(0).toUpperCase() + style.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{t.chat.timeLabel}</label>
                                                    <Select
                                                        value={preferences.learningTime}
                                                        onValueChange={(v) => setPreferences({ ...preferences, learningTime: v as RoadmapPreferences["learningTime"] })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs bg-background/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="casual">{t.chat.casual}</SelectItem>
                                                            <SelectItem value="moderate">{t.chat.moderate}</SelectItem>
                                                            <SelectItem value="intensive">{t.chat.intensive}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{t.chat.goalLabel}</label>
                                                    <Select
                                                        value={preferences.goal}
                                                        onValueChange={(v) => setPreferences({ ...preferences, goal: v as RoadmapPreferences["goal"] })}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs bg-background/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="career">{t.chat.career}</SelectItem>
                                                            <SelectItem value="project">{t.chat.project}</SelectItem>
                                                            <SelectItem value="certification">{t.chat.certification}</SelectItem>
                                                            <SelectItem value="hobby">{t.chat.hobby}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full px-2 mt-6 max-w-md mx-auto">
                                <div className="flex items-center gap-2 px-1 mb-2">
                                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                                    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t.chat.startWithTopic}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {[
                                        { icon: <Rocket className="h-5 w-5" />, text: t.chat.suggestion1 },
                                        { icon: <FileText className="h-5 w-5" />, text: t.chat.suggestion2 },
                                        { icon: <Target className="h-5 w-5" />, text: t.chat.suggestion3 },
                                    ].map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion.text)}
                                            className="group flex items-center gap-3 text-xs text-left p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-300 relative overflow-hidden"
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300 group-hover:scale-110 group-hover:-rotate-6 transform p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10">
                                                {suggestion.icon}
                                            </div>
                                            <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
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
                                    {msg.role === "assistant" ? (
                                        <div className="h-8 w-8 rounded-full bg-black dark:bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    ) : (
                                        <Avatar className="h-8 w-8 border flex-shrink-0">
                                            <AvatarImage src={user?.avatarUrl || ""} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || "ME"}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
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
                                                <>
                                                    <MarkdownContent content={msg.content} />
                                                    <StreamingCursor />
                                                </>
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
                                                        <TooltipContent><p className="text-xs">{t.common.copy}</p></TooltipContent>
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
                                                            <TooltipContent><p className="text-xs">{t.common.regenerate}</p></TooltipContent>
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
                                                        <TooltipContent><p className="text-xs">{t.common.goodResponse}</p></TooltipContent>
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
                                                        <TooltipContent><p className="text-xs">{t.common.badResponse}</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea >

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
                <form 
                    className="relative flex w-full items-center bg-muted/40 border border-muted-foreground/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-[24px] p-1.5 shadow-sm transition-all duration-300" 
                    onSubmit={handleSendMessage}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 min-h-[44px] shadow-none"
                        placeholder={t.chat.askAnything}
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
                                        className="h-10 w-10 rounded-[18px] shrink-0"
                                        onClick={handleStopGeneration}
                                    >
                                        <Square className="h-4 w-4" />
                                        <span className="sr-only">Stop</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">{t.chat.stopGenerating}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={!inputValue.trim()}
                            className="h-10 w-10 rounded-[18px] shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform active:scale-95"
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
