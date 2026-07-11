import { cn } from "@/lib/utils";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { Zap } from "lucide-react";

interface LevelProgressBarProps {
  xp: number;
  level: number;
  className?: string;
  compact?: boolean;
}

/** Level formula mirrors server: level = floor(xp / 500) + 1 */
export function LevelProgressBar({
  xp,
  level,
  className,
  compact,
}: LevelProgressBarProps) {
  const { t } = useAppLanguage();
  const xpInLevel = xp % 500;
  const pct = Math.min(100, Math.round((xpInLevel / 500) * 100));
  const toNext = 500 - xpInLevel;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)} title={`${xp} XP · Lv.${level}`}>
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
          Lv.{level}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-violet-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5 rounded-lg border bg-muted/30 p-2.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 font-semibold">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          {t.ux.level} {level}
        </span>
        <span className="text-muted-foreground">
          {xpInLevel}/500 XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-violet-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t.ux.level} ${level}`}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {t.ux.xpToNextLevel.replace("{xp}", String(toNext))}
      </p>
    </div>
  );
}
