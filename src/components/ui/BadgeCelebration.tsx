import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { Share2, X } from "lucide-react";

export interface CelebrationPayload {
  title: string;
  description: string;
  icon?: string;
}

let showCelebrationFn: ((payload: CelebrationPayload) => void) | null = null;

/** Call from anywhere to celebrate a badge / milestone */
export function celebrateAchievement(payload: CelebrationPayload) {
  showCelebrationFn?.(payload);
}

export function BadgeCelebrationHost() {
  const { t } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<CelebrationPayload | null>(null);

  useEffect(() => {
    showCelebrationFn = (p) => {
      setPayload(p);
      setOpen(true);
    };
    return () => {
      showCelebrationFn = null;
    };
  }, []);

  const handleShare = async () => {
    if (!payload) return;
    const text = `${payload.title} — ${payload.description} · SkillBridge`;
    try {
      if (navigator.share) {
        await navigator.share({ title: payload.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden sm:max-w-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.25), transparent 60%)",
          }}
        />
        <DialogHeader className="relative items-center text-center">
          <div className="mb-2 animate-bounce text-5xl" aria-hidden>
            {payload?.icon || "🏆"}
          </div>
          <DialogTitle className="text-xl">{payload?.title}</DialogTitle>
          <DialogDescription>{payload?.description}</DialogDescription>
        </DialogHeader>
        <div className="relative flex flex-col gap-2 pt-2">
          <Button onClick={handleShare} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            {t.ux.shareAchievement}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full">
            <X className="mr-2 h-4 w-4" />
            {t.common.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
