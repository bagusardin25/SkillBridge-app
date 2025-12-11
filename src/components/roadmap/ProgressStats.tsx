import { useRoadmapStore } from "@/store/useRoadmapStore";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useMemo } from "react";

interface ProgressStatsProps {
    variant?: "compact" | "detailed";
    className?: string;
}

export function ProgressStats({ variant = "compact", className = "" }: ProgressStatsProps) {
    const { nodes } = useRoadmapStore();

    const stats = useMemo(() => {
        const total = nodes.length;
        const completed = nodes.filter(n => n.data?.isCompleted || n.data?.quizPassed).length;
        const inProgress = nodes.filter(n => n.data?.status === "in-progress").length;
        const pending = total - completed - inProgress;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, inProgress, pending, percentage };
    }, [nodes]);

    if (stats.total === 0) return null;

    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <Progress 
                    value={stats.percentage} 
                    className={`w-24 h-2 ${stats.percentage === 100 ? '[&>div]:bg-emerald-500' : ''}`} 
                />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {stats.completed}/{stats.total}
                </span>
                {stats.percentage === 100 && (
                    <Trophy className="h-4 w-4 text-amber-500" />
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className={`text-sm font-bold ${stats.percentage === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                    {stats.percentage}%
                </span>
            </div>
            
            <Progress 
                value={stats.percentage} 
                className={`h-2 ${stats.percentage === 100 ? '[&>div]:bg-emerald-500' : ''}`}
            />

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Circle className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                    <Circle className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-lg font-bold">{stats.pending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                </div>
            </div>

            {stats.percentage === 100 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-900/20 dark:to-emerald-900/20 border border-amber-200 dark:border-amber-800">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Congratulations! Roadmap completed!
                    </span>
                </div>
            )}
        </div>
    );
}
