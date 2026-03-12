import { useState, useEffect } from "react";
import { CheckCircle, Lock, Sparkles, Loader2, Brain, Search, Layout } from "lucide-react";

export function StaticRoadmapVisual() {
    // 0: Initial Loading ("Generating...")
    // 1: Node 1 Loading ("Analyzing Topic...")
    // 2: Node 1 Done (React)
    // 3: Line 1
    // 4: Node 2 Loading ("Gathering Resources...")
    // 5: Node 2 Done (TypeScript)
    // 6: Line 2
    // 7: Node 3 Loading ("Structuring Path...")
    // 8: Node 3 Done (System Design)
    // 9: AI Bubble
    const [step, setStep] = useState(0);

    useEffect(() => {
        const schedule = [
            { step: 1, delay: 1500 }, // Wait 1.5s on main loading
            { step: 2, delay: 1000 }, // Node 1 analyzing for 1s
            { step: 3, delay: 600 },  // Node 1 done, wait 0.6s
            { step: 4, delay: 500 },  // Line 1 draws, wait 0.5s
            { step: 5, delay: 1000 }, // Node 2 gathering for 1s
            { step: 6, delay: 600 },  // Node 2 done, wait 0.6s
            { step: 7, delay: 500 },  // Line 2 draws, wait 0.5s
            { step: 8, delay: 1000 }, // Node 3 structuring for 1s
            { step: 9, delay: 600 },  // Node 3 done, wait 0.6s
            { step: 0, delay: 4000 }, // Full roadmap visible for 4s, then loop
        ];

        let timeoutId: ReturnType<typeof setTimeout>;

        const runSchedule = (currentIndex = 0) => {
            if (currentIndex >= schedule.length) currentIndex = 0;
            const currentObj = schedule[currentIndex];
            
            timeoutId = setTimeout(() => {
                setStep(currentObj.step);
                runSchedule(currentIndex + 1);
            }, currentObj.delay);
        };

        // Start animation immediately
        timeoutId = setTimeout(() => {
            setStep(1);
            runSchedule(1);
        }, schedule[0].delay);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[400px] sm:min-h-[550px] flex items-center justify-center pointer-events-none overflow-hidden">
            {/* The Interactive Roadmap Visual container */}
            <div className="relative w-[500px] h-[500px] pointer-events-auto scale-[0.6] sm:scale-[0.85] md:scale-100 origin-center shrink-0">
                
                {/* --- Step 0: Loading State --- */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover/80 backdrop-blur-md border shadow-2xl rounded-2xl p-6 w-64 flex flex-col items-center gap-4 transition-all duration-500 z-50 ${step === 0 ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <Sparkles className="absolute -top-3 -right-3 h-4 w-4 text-violet-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Generating Pathway...</div>
                    <div className="w-full bg-muted overflow-hidden rounded-full h-1.5">
                        <div className={`bg-primary h-full rounded-full transition-all duration-[1500ms] ease-in-out ${step === 0 ? "w-full" : "w-0"}`} />
                    </div>
                </div>

                {/* --- Node 1: React --- */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-56 px-4 py-3 text-card-foreground border-border rounded-lg shadow-md border !border-l-[5px] min-h-[90px] z-20 cursor-pointer flex flex-col transition-all duration-700 
                ${step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"} 
                ${step >= 2 ? "!border-l-emerald-500 bg-emerald-50/90 dark:!bg-emerald-900/50 backdrop-blur ring-1 ring-emerald-500/30" : "!border-l-muted bg-card/50 border-dashed"}`}>
                    
                    {step >= 2 ? (
                        <>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                            <div className="absolute -top-2 -right-2 z-10 p-0.5 rounded-full text-emerald-500 bg-white dark:bg-gray-900 shadow-sm animate-in zoom-in duration-300">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div className="absolute left-3 top-3 z-20">
                                <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 min-w-[28px] h-7 rounded-sm shadow-sm border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 animate-in fade-in duration-300">
                                    <CheckCircle className="h-4 w-4" />
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1 w-full pt-2 animate-in fade-in duration-300">
                                <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">React.js</span>
                                <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                                    Core UI Library
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-2 opacity-60">
                            <Brain className="h-5 w-5 animate-pulse text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground text-center">Analyzing Topic...</span>
                        </div>
                    )}
                </div>

                {/* --- Node 2: TypeScript --- */}
                <div className={`absolute top-[180px] left-0 w-56 px-4 py-3 text-card-foreground rounded-lg border border-l-[5px] scale-[1.02] min-h-[90px] z-20 cursor-pointer flex flex-col transition-all duration-700 
                ${step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
                ${step >= 5 ? "border-l-primary bg-card/90 dark:bg-card/70 ring-[3px] ring-primary ring-offset-2 ring-offset-background/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] !border-primary" : "!border-l-muted bg-card/50 border-dashed"}`}>
                    
                    {step >= 5 ? (
                        <>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background z-50"></div>
                            <div className="absolute left-3 top-3 z-20">
                                <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 min-w-[28px] h-7 rounded-sm shadow-sm border bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 animate-in fade-in duration-300">
                                    <span className="text-sm font-sans tracking-tight">2</span>
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1 w-full pt-2 animate-in fade-in duration-300">
                                <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">TypeScript</span>
                                <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                                    Type Safety
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-2 opacity-60">
                            <Search className="h-5 w-5 animate-pulse text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground text-center">Gathering Resources...</span>
                        </div>
                    )}
                </div>

                {/* --- Node 3: System Design --- */}
                <div className={`absolute top-[340px] left-[260px] w-56 px-4 py-3 text-card-foreground border-border rounded-lg shadow-md border border-l-[5px] transition-all duration-700 min-h-[90px] z-20 cursor-pointer flex flex-col 
                ${step >= 7 ? "opacity-60 translate-y-0" : "opacity-0 -translate-y-4"}
                ${step >= 8 ? "border-l-violet-500 bg-violet-50/80 dark:bg-violet-900/40 backdrop-blur grayscale-[40%] hover:opacity-100 hover:grayscale-0" : "!border-l-muted bg-card/50 border-dashed"}`}>
                    
                    {step >= 8 ? (
                        <>
                            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-muted-foreground/80 border-2 border-background z-50"></div>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-muted-foreground/80 border-2 border-background z-50"></div>
                            <div className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full text-muted-foreground bg-muted shadow-sm ring-1 ring-border animate-in zoom-in duration-300">
                                <Lock className="h-3.5 w-3.5" />
                            </div>
                            <div className="absolute left-3 top-3 z-20">
                                <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 min-w-[28px] h-7 rounded-sm shadow-sm border bg-muted/60 text-muted-foreground border-border/50 backdrop-blur-sm animate-in fade-in duration-300">
                                    <span className="text-sm font-sans tracking-tight">3</span>
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1 w-full pt-2 animate-in fade-in duration-300">
                                <span className="text-base font-bold break-words leading-tight text-center px-4 w-full">System Design</span>
                                <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 text-center pointer-events-none">
                                    Scalability Patterns
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 w-full h-full gap-2 opacity-60">
                            <Layout className="h-5 w-5 animate-pulse text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground text-center">Structuring Path...</span>
                        </div>
                    )}
                </div>

                {/* --- AI Tutor Bubble --- */}
                {/* Notice the animate-bounce class keeps it bouncing consistently when visible */}
                <div className={`absolute top-[150px] right-0 z-30 bg-violet-600 p-4 rounded-2xl rounded-bl-none shadow-[0_0_20px_rgba(168,85,247,0.4)] transform rotate-2 animate-bounce flex items-start gap-3 max-w-[170px] transition-all duration-500 delay-100 ${step >= 9 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                    <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center">
                        <span className="text-violet-600 text-[10px] font-bold">AI</span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight text-white">"Great progress! Ready for the React hooks quiz?"</p>
                </div>

                {/* --- Connection Lines SVG --- */}
                <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 500">
                    <defs>
                        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
                        </marker>
                        <marker id="arrow-locked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground/40" />
                        </marker>
                    </defs>

                    {/* Path 1: React to TypeScript */}
                    <path 
                        d="M 250 94 C 250 140, 112 130, 112 176" 
                        fill="none" 
                        className={`stroke-primary drop-shadow-[0_0_2px_rgba(99,102,241,0.4)] transition-all duration-1000 ${step >= 4 ? "opacity-100" : "opacity-0"}`} 
                        strokeWidth="3" 
                        strokeDasharray="5,5" 
                        markerEnd="url(#arrow-active)"
                    />
                    
                    {/* Path 2: TypeScript to System Design */}
                    <path 
                        d="M 112 276 C 112 340, 180 385, 258 385" 
                        fill="none" 
                        className={`stroke-muted-foreground/40 transition-all duration-1000 ${step >= 7 ? "opacity-100" : "opacity-0"}`} 
                        strokeWidth="1.5" 
                        strokeDasharray="5,5" 
                        markerEnd="url(#arrow-locked)"
                    />
                </svg>
            </div>
        </div>
    );
}
