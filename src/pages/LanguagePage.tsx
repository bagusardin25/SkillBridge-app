import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useAppLanguage } from "@/contexts/LanguageContext";

const LANGUAGES = [
    { code: "id" as const, name: "Bahasa Indonesia", flag: "🇮🇩", description: "Indonesian" },
    { code: "en" as const, name: "English", flag: "🇺🇸", description: "English (US)" },
];

export function LanguagePage() {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useAppLanguage();
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    const handleSave = () => {
        setLanguage(selectedLanguage);
        const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
        const msg = t.languagePage.languageChanged.replace("{name}", langName);
        toast.success(msg);
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-4 p-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold">{t.languagePage.title}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-w-md mx-auto space-y-4">
                <p className="text-sm text-muted-foreground">{t.languagePage.description}</p>

                {LANGUAGES.map((lang) => (
                    <button 
                        key={lang.code} 
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                            selectedLanguage === lang.code 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                        }`}
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                            <p className="font-medium">{lang.name}</p>
                            <p className="text-sm text-muted-foreground">{lang.description}</p>
                        </div>
                        {selectedLanguage === lang.code && <Check className="h-5 w-5 text-primary" />}
                    </button>
                ))}
                
                <Button onClick={handleSave} className="w-full">{t.common.save}</Button>
            </div>
        </div>
    );
}
