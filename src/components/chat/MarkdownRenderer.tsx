import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Copy Button ────────────────────────────────────────────

interface CopyButtonProps {
    text: string;
    className?: string;
    /** If true, show "Copy" / "Copied!" label next to the icon */
    label?: boolean;
}

export function CopyButton({ text, className, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (label) {
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
                <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
        );
    }

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

// ── Markdown Content ───────────────────────────────────────

interface MarkdownContentProps {
    content: string;
    /** "compact" = smaller spacing (side/node chat), "full" = richer (full-screen chat) */
    variant?: "compact" | "full";
}

export function MarkdownContent({ content, variant = "compact" }: MarkdownContentProps) {
    const proseClasses = variant === "full"
        ? "prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline"
        : "prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0";

    const showLanguageBar = variant === "full";

    return (
        <div className={proseClasses}>
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

                        if (showLanguageBar) {
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

// ── Streaming Cursor ───────────────────────────────────────

export function StreamingCursor() {
    return <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-text-bottom rounded-sm" />;
}
