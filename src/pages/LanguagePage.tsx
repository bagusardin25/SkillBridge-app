import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩", description: "Indonesian" },
    { code: "en", name: "English", flag: "🇺🇸", description: "English (US)" },
];

export function LanguagePage() {
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState(() => 
        localStorage.getItem("language") || "id"
    );

    const handleSave = () => {
        localStorage.setItem("language", selectedLanguage);
        const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name;
        toast.success(`Bahasa diubah ke ${langName}`);
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
                    <h1 className="text-xl font-semibold">Language / Bahasa</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-w-md mx-auto space-y-4">
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
                
                <p className="text-xs text-muted-foreground text-center pt-4">
                    Saat ini aplikasi hanya tersedia dalam Bahasa Indonesia.
                    <br />
                    Full translation akan tersedia di versi mendatang.
                </p>
                
                <Button onClick={handleSave} className="w-full">Simpan</Button>
            </div>
        </div>
    );
}
