import { badges, calculateEarnedBadges, getBadgeProgress, type UserStats } from "@/data/badges";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgesSectionProps {
    stats: UserStats;
    compact?: boolean;
}

export function BadgesSection({ stats, compact = false }: BadgesSectionProps) {
    const earnedBadges = calculateEarnedBadges(stats);
    const earnedIds = new Set(earnedBadges.map(b => b.id));

    if (compact) {
        // Show only earned badges in a row
        return (
            <div className="flex flex-wrap gap-2">
                {earnedBadges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No badges earned yet</p>
                ) : (
                    earnedBadges.map(badge => (
                        <TooltipProvider key={badge.id} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={cn(
                                        "text-2xl p-2 rounded-lg transition-transform hover:scale-110",
                                        badge.bgColor
                                    )}>
                                        {badge.icon}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{badge.name}</p>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))
                )}
            </div>
        );
    }

    // Full view with all badges
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Achievements</h3>
                <span className="text-sm text-muted-foreground">
                    {earnedBadges.length}/{badges.length} earned
                </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {badges.map(badge => {
                    const isEarned = earnedIds.has(badge.id);
                    const progress = getBadgeProgress(badge, stats);

                    return (
                        <TooltipProvider key={badge.id} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={cn(
                                        "relative flex flex-col items-center p-3 rounded-lg border transition-all",
                                        isEarned 
                                            ? `${badge.bgColor} border-transparent` 
                                            : "bg-muted/30 border-dashed opacity-60 grayscale"
                                    )}>
                                        <span className={cn(
                                            "text-3xl mb-1",
                                            isEarned && "animate-in zoom-in duration-300"
                                        )}>
                                            {badge.icon}
                                        </span>
                                        <span className="text-[10px] font-medium text-center line-clamp-1">
                                            {badge.name}
                                        </span>
                                        {!isEarned && (
                                            <div className="absolute top-1 right-1">
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px]">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="font-semibold">{badge.name}</p>
                                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                                        </div>
                                        {!isEarned && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Progress</span>
                                                    <span>{Math.round(progress)}%</span>
                                                </div>
                                                <Progress value={progress} className="h-1.5" />
                                            </div>
                                        )}
                                        {isEarned && (
                                            <p className="text-xs text-emerald-500 font-medium">✓ Earned!</p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
}
