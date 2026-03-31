import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppLanguage } from "@/contexts/LanguageContext";
import { deleteAccount } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    X,
    Sun,
    Moon,
    MessageSquare,
    Trash2,
    Monitor,
    Globe,
} from "lucide-react";
import { LanguageDialog } from "@/components/ui/LanguageDialog";

const LANGUAGE_NAMES: Record<string, string> = {
    en: "English",
    id: "Bahasa Indonesia",
};

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme, isAiPanelOpen, toggleAiPanel } = useRoadmapStore();
    const { language, t } = useAppLanguage();
    const [langDialogOpen, setLangDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            logout();
            navigate("/");
            toast.success(t.toasts.accountDeleted);
        } catch (error) {
            console.error("Delete account error:", error);
            toast.error(t.toasts.deleteAccountFailed);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-[60] h-14 border-b bg-background flex items-center justify-between px-4">
                <h1 className="text-lg font-semibold">{t.settingsPage.title}</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            {t.settingsPage.appearance}
                        </CardTitle>
                        <CardDescription>
                            {t.settingsPage.appearanceDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="dark-mode" className="font-medium">
                                    {t.settingsPage.darkMode}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t.settingsPage.darkModeDescription}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-muted-foreground" />
                                <Switch
                                    id="dark-mode"
                                    checked={isDarkMode}
                                    onCheckedChange={toggleTheme}
                                />
                                <Moon className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Language */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {t.settingsPage.language}
                        </CardTitle>
                        <CardDescription>
                            {t.settingsPage.languageDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-medium">
                                    {t.settingsPage.currentLanguage}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {LANGUAGE_NAMES[language] || language}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setLangDialogOpen(true)}>
                                {t.settingsPage.changeLanguage}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Editor Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            {t.settingsPage.editor}
                        </CardTitle>
                        <CardDescription>
                            {t.settingsPage.editorDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="ai-panel" className="font-medium">
                                    {t.settingsPage.aiPanel}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t.settingsPage.aiPanelDescription}
                                </p>
                            </div>
                            <Switch
                                id="ai-panel"
                                checked={isAiPanelOpen}
                                onCheckedChange={toggleAiPanel}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            {t.settingsPage.dangerZone}
                        </CardTitle>
                        <CardDescription>
                            {t.settingsPage.dangerZoneDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-medium">{t.settingsPage.deleteAccount}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t.settingsPage.deleteAccountDescription}
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        {t.settingsPage.deleteAccount}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t.settingsPage.deleteAccountConfirmTitle}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t.settingsPage.deleteAccountConfirmDescription}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {t.settingsPage.deleteAccount}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <div className="text-center text-sm text-muted-foreground pt-4">
                    <p>{t.settingsPage.loggedInAs} <span className="font-medium">{user?.email}</span></p>
                </div>
            </div>

            {/* Language Dialog */}
            <LanguageDialog open={langDialogOpen} onOpenChange={setLangDialogOpen} />
        </div>
    );
}
