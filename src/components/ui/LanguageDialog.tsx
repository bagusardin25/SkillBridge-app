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

interface LanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const LANGUAGES = [
    {
        code: "id",
        name: "Bahasa Indonesia",
        flag: "🇮🇩",
        description: "Indonesian",
    },
    {
        code: "en",
        name: "English",
        flag: "🇺🇸",
        description: "English (US)",
    },
];

export function LanguageDialog({ open, onOpenChange }: LanguageDialogProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem("language") || "id";
    });

    useEffect(() => {
        if (open) {
            setSelectedLanguage(localStorage.getItem("language") || "id");
        }
    }, [open]);

    const handleSave = () => {
        localStorage.setItem("language", selectedLanguage);
        
        const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
        toast.success(`Bahasa diubah ke ${langName}`);
        
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language / Bahasa
                    </DialogTitle>
                    <DialogDescription>
                        Pilih bahasa yang ingin digunakan
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

                <div className="text-xs text-muted-foreground text-center px-4">
                    <p>Saat ini aplikasi hanya tersedia dalam Bahasa Indonesia.</p>
                    <p>Full translation akan tersedia di versi mendatang.</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
