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
    className?: string;
}

const CODE_BLOCK_STYLE = {
    margin: 0,
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    maxWidth: "100%",
    overflowX: "auto" as const,
    // Prevent Prism/pre from forcing parent wider
    whiteSpace: "pre" as const,
    wordBreak: "normal" as const,
    overflowWrap: "normal" as const,
};

export function MarkdownContent({ content, variant = "compact", className }: MarkdownContentProps) {
    const proseClasses = variant === "full"
        ? "prose prose-sm dark:prose-invert max-w-full prose-p:my-1.5 prose-headings:my-2.5 prose-headings:break-words prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline prose-pre:max-w-full prose-pre:overflow-x-auto"
        : "prose prose-sm dark:prose-invert max-w-full prose-p:my-1 prose-headings:my-2 prose-headings:break-words prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:max-w-full prose-pre:overflow-x-auto";

    const showLanguageBar = variant === "full";

    return (
        <div
            className={cn(
                proseClasses,
                // Critical: never expand parent flex/sidebar
                "min-w-0 max-w-full overflow-x-hidden break-words [overflow-wrap:anywhere]",
                // Tables / pre / code stay constrained
                "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
                "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
                "[&_img]:max-w-full [&_img]:h-auto",
                "[&_a]:break-all",
                className
            )}
        >
            <ReactMarkdown
                components={{
                    p({ children }) {
                        return <p className="min-w-0 max-w-full break-words [overflow-wrap:anywhere]">{children}</p>;
                    },
                    h1({ children }) {
                        return <h1 className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-base font-bold">{children}</h1>;
                    },
                    h2({ children }) {
                        return <h2 className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-sm font-bold">{children}</h2>;
                    },
                    h3({ children }) {
                        return <h3 className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-sm font-semibold">{children}</h3>;
                    },
                    li({ children }) {
                        return <li className="min-w-0 break-words [overflow-wrap:anywhere]">{children}</li>;
                    },
                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all [overflow-wrap:anywhere]"
                            >
                                {children}
                            </a>
                        );
                    },
                    // Fenced blocks: react-markdown wraps code in pre — pass through so only code paints the block
                    pre({ children }) {
                        return <>{children}</>;
                    },
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeText = String(children).replace(/\n$/, "");
                        const isBlock =
                            !!match ||
                            codeText.includes("\n") ||
                            Boolean(className?.includes("language-"));

                        if (!isBlock) {
                            return (
                                <code
                                    className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs [overflow-wrap:anywhere]"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        const language = match?.[1] || "text";

                        if (showLanguageBar && match) {
                            return (
                                <div className="group relative my-2 min-w-0 max-w-full overflow-hidden rounded-lg">
                                    <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 px-3 py-2">
                                        <span className="truncate font-mono text-xs text-zinc-400">{language}</span>
                                        <CopyButton text={codeText} label />
                                    </div>
                                    <div className="min-w-0 max-w-full overflow-x-auto">
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={language}
                                            PreTag="div"
                                            customStyle={{
                                                ...CODE_BLOCK_STYLE,
                                                borderTopLeftRadius: 0,
                                                borderTopRightRadius: 0,
                                                borderBottomLeftRadius: "0.5rem",
                                                borderBottomRightRadius: "0.5rem",
                                                fontSize: "0.8rem",
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    whiteSpace: "pre",
                                                    wordBreak: "normal",
                                                },
                                            }}
                                        >
                                            {codeText}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="group relative my-2 min-w-0 max-w-full overflow-hidden rounded-lg">
                                <div className="min-w-0 max-w-full overflow-x-auto">
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={language}
                                        PreTag="div"
                                        customStyle={CODE_BLOCK_STYLE}
                                        codeTagProps={{
                                            style: {
                                                whiteSpace: "pre",
                                                wordBreak: "normal",
                                            },
                                        }}
                                    >
                                        {codeText}
                                    </SyntaxHighlighter>
                                </div>
                                <CopyButton
                                    text={codeText}
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                                />
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
    return <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-violet-500 align-text-bottom" />;
}
