import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Check } from "lucide-react";
import { useAppLanguage } from "@/contexts/LanguageContext";
import type { AppLanguage } from "@/lib/appTranslations";

interface LanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const LANGUAGES = [
    {
        code: "id" as const,
        name: "Bahasa Indonesia",
        flag: "🇮🇩",
        description: "Indonesian",
    },
    {
        code: "en" as const,
        name: "English",
        flag: "🇺🇸",
        description: "English (US)",
    },
];

export function LanguageDialog({ open, onOpenChange }: LanguageDialogProps) {
    const { language, setLanguage, t } = useAppLanguage();
    const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(language);

    useEffect(() => {
        if (open) {
            setSelectedLanguage(language);
        }
    }, [open, language]);

    const handleSave = () => {
        setLanguage(selectedLanguage);
        
        const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
        const msg = t.languagePage.languageChanged.replace("{name}", langName);
        toast.success(msg);
        
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t.languageDialog.title}
                    </DialogTitle>
                    <DialogDescription>
                        {t.languageDialog.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all text-left ${
                                selectedLanguage === lang.code
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="flex-1">
                                <p className="font-medium">{lang.name}</p>
                                <p className="text-sm text-muted-foreground">{lang.description}</p>
                            </div>
                            {selectedLanguage === lang.code && (
                                <Check className="h-5 w-5 text-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={handleSave}>
                        {t.common.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
