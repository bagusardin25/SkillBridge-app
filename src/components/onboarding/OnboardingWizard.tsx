import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import {
  clearPendingGoal,
  getPendingGoal,
  isOnboardingDone,
  setOnboardingDone,
  setPendingGoal,
} from "@/lib/learningUtils";
import type { RoadmapPreferences } from "@/lib/api";
import { Sparkles, Target, SlidersHorizontal, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultPrefs: RoadmapPreferences = {
  skillLevel: "beginner",
  learningTime: "moderate",
  learningStyle: "balanced",
  goal: "career",
};

interface OnboardingWizardProps {
  onComplete?: (goal: string, preferences: RoadmapPreferences) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useAppLanguage();
  const { toggleAiPanel, isAiPanelOpen } = useRoadmapStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState<RoadmapPreferences>(defaultPrefs);

  useEffect(() => {
    if (isOnboardingDone()) {
      // Still apply pending goal into chat if present
      const pending = getPendingGoal();
      if (pending) {
        sessionStorage.setItem("skillbridge_seed_chat", pending);
      }
      return;
    }
    const pending = getPendingGoal() || "";
    setGoal(pending);
    setOpen(true);
  }, []);

  const steps = [
    { icon: Target, title: t.ux.onboardingStep1Title, desc: t.ux.onboardingStep1Desc },
    { icon: SlidersHorizontal, title: t.ux.onboardingStep2Title, desc: t.ux.onboardingStep2Desc },
    { icon: Rocket, title: t.ux.onboardingStep3Title, desc: t.ux.onboardingStep3Desc },
  ];

  const progress = ((step + 1) / steps.length) * 100;

  const finish = (skipGenerate = false) => {
    setOnboardingDone();
    if (goal.trim()) {
      setPendingGoal(goal.trim());
      sessionStorage.setItem("skillbridge_seed_chat", goal.trim());
      sessionStorage.setItem(
        "skillbridge_seed_prefs",
        JSON.stringify(prefs)
      );
    }
    setOpen(false);
    if (!skipGenerate && goal.trim()) {
      if (!isAiPanelOpen) toggleAiPanel();
      onComplete?.(goal.trim(), prefs);
    }
    clearPendingGoal();
  };

  const canNext =
    step === 0 ? goal.trim().length >= 3 : true;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish(true)}>
      <DialogContent className="sm:max-w-md" aria-describedby="onboarding-desc">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              SkillBridge
            </span>
          </div>
          <DialogTitle>{steps[step].title}</DialogTitle>
          <DialogDescription id="onboarding-desc">
            {steps[step].desc}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5" />

        <div className="flex gap-1.5 py-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3 py-2">
            <Label htmlFor="onboarding-goal">{t.ux.yourGoal}</Label>
            <Input
              id="onboarding-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t.ux.goalPlaceholder}
              autoFocus
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">{t.ux.goalHint}</p>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t.chat.skillLevel}</Label>
              <Select
                value={prefs.skillLevel}
                onValueChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    skillLevel: v as RoadmapPreferences["skillLevel"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.chat.timeLabel}</Label>
              <Select
                value={prefs.learningTime}
                onValueChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    learningTime: v as RoadmapPreferences["learningTime"],
                  }))
                }
              >
                <SelectTrigger>
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
              <Label>{t.chat.learningStyle}</Label>
              <Select
                value={prefs.learningStyle}
                onValueChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    learningStyle: v as RoadmapPreferences["learningStyle"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.chat.goalLabel}</Label>
              <Select
                value={prefs.goal}
                onValueChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    goal: v as RoadmapPreferences["goal"],
                  }))
                }
              >
                <SelectTrigger>
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
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-xl border bg-muted/30 p-4 py-2">
            <p className="text-sm font-medium">{t.ux.readyToGenerate}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">“{goal}”</span>
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>· {prefs.skillLevel} · {prefs.learningTime}</li>
              <li>· {prefs.learningStyle} · {prefs.goal}</li>
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step === 0 ? finish(true) : setStep((s) => s - 1))}
          >
            {step === 0 ? t.ux.skipForNow : t.common.back}
          </Button>
          <div className="flex gap-2">
            {step < 2 ? (
              <Button size="sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                {t.ux.next}
              </Button>
            ) : (
              <Button size="sm" onClick={() => finish(false)}>
                <Sparkles className="mr-1.5 h-4 w-4" />
                {t.ux.generateRoadmap}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
