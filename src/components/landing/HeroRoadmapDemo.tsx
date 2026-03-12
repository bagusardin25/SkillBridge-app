import { CheckCircle, Lock } from "lucide-react";

export function StaticRoadmapVisual() {
    return (
        <div className="relative w-full h-full min-h-[400px] sm:min-h-[550px] flex items-center justify-center pointer-events-none overflow-hidden">
            {/* The Interactive Roadmap Visual container - Increased to 500x500 */}
            <div className="relative w-[500px] h-[500px] pointer-events-auto scale-[0.6] sm:scale-[0.85] md:scale-100 origin-center shrink-0">
                {/* Node 1: React (Completed) - Positioned Top Center */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 px-4 py-3 text-card-foreground border-border rounded-lg shadow-md border !border-l-[5px] !border-l-emerald-500 bg-emerald-50/90 dark:!bg-emerald-900/50 backdrop-blur ring-1 ring-emerald-500/30 min-h-[90px] z-20 cursor-pointer flex flex-col">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                    <div className="absolute -top-2 -right-2 z-10 p-0.5 rounded-full text-emerald-500 bg-white dark:bg-gray-900 shadow-sm">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="absolute left-3 top-3 z-20">
                        <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 min-w-[28px] h-7 rounded-sm shadow-sm border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 w-full pt-2">
                        <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">React.js</span>
                        <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                            Core UI Library
                        </div>
                    </div>
                </div>

                {/* Node 2: TypeScript (Active) - Moved further down and left */}
                <div className="absolute top-[180px] left-0 w-56 px-4 py-3 text-card-foreground rounded-lg border border-l-[5px] border-l-primary bg-card/90 dark:bg-card/70 ring-[3px] ring-primary ring-offset-2 ring-offset-background/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] !border-primary scale-[1.02] min-h-[90px] z-20 cursor-pointer transform transition-transform flex flex-col">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                    <div className="absolute left-3 top-3 z-20">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 min-w-[28px] h-7 rounded-sm shadow-sm border bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
                            <span className="text-sm font-sans tracking-tight">2</span>
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 w-full pt-2">
                        <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">TypeScript</span>
                        <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                            Type Safety
                        </div>
                    </div>
                </div>

                {/* Node 3: System Design (Future) - Moved further down and right */}
                <div className="absolute top-[340px] left-[260px] w-56 px-4 py-3 text-card-foreground border-border rounded-lg shadow-md border border-l-[5px] border-l-violet-500 bg-violet-50/80 dark:bg-violet-900/40 backdrop-blur opacity-60 grayscale-[40%] hover:opacity-100 hover:grayscale-0 transition-all min-h-[90px] z-20 cursor-pointer flex flex-col">
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-muted-foreground/80 border-2 border-background z-50"></div>
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-muted-foreground/80 border-2 border-background z-50"></div>
                    <div className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full text-muted-foreground bg-muted shadow-sm ring-1 ring-border">
                        <Lock className="h-3.5 w-3.5" />
                    </div>
                    <div className="absolute left-3 top-3 z-20">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 min-w-[28px] h-7 rounded-sm shadow-sm border bg-muted/60 text-muted-foreground border-border/50 backdrop-blur-sm">
                            <span className="text-sm font-sans tracking-tight">3</span>
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 w-full pt-2">
                        <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">System Design</span>
                        <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                            Scalability Patterns
                        </div>
                    </div>
                </div>

                {/* AI Tutor Bubble - Repositioned to not overlap nodes */}
                <div className="absolute top-[150px] right-0 z-30 bg-violet-600 p-4 rounded-2xl rounded-bl-none shadow-[0_0_20px_rgba(168,85,247,0.4)] transform rotate-2 animate-bounce flex items-start gap-3 max-w-[170px]">
                    <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center">
                        <span className="text-violet-600 text-[10px] font-bold">AI</span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight text-white">"Great progress! Ready for the React hooks quiz?"</p>
                </div>

                {/* Connection Lines SVG - Updated for 500x500 coordinates */}
                <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 500">
                    <defs>
                        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
                        </marker>
                        <marker id="arrow-locked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground opacity-40" />
                        </marker>
                    </defs>

                    {/* Path 1: React to TypeScript */}
                    <path 
                        d="M 250 94 C 250 140, 112 130, 112 176" 
                        fill="none" 
                        className="stroke-primary drop-shadow-[0_0_2px_rgba(99,102,241,0.4)]" 
                        strokeWidth="3" 
                        strokeDasharray="5,5" 
                        markerEnd="url(#arrow-active)"
                    />
                    
                    {/* Path 2: TypeScript to System Design */}
                    <path 
                        d="M 112 276 C 112 340, 180 385, 258 385" 
                        fill="none" 
                        className="stroke-muted-foreground opacity-40" 
                        strokeWidth="1.5" 
                        strokeDasharray="5,5" 
                        markerEnd="url(#arrow-locked)"
                    />
                </svg>
            </div>
        </div>
    );
}
