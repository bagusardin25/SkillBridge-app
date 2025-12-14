import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
    Bell,
    Trash2,
    Monitor,
} from "lucide-react";

export function SettingsPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isDarkMode, toggleTheme, isAiPanelOpen, toggleAiPanel } = useRoadmapStore();

    const handleDeleteAccount = () => {
        toast.info("Fitur hapus akun akan segera tersedia");
    };

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-[60] h-14 border-b bg-background flex items-center justify-between px-4">
                <h1 className="text-lg font-semibold">Settings</h1>
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
                            Appearance
                        </CardTitle>
                        <CardDescription>
                            Customize how SkillBridge looks on your device
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="dark-mode" className="font-medium">
                                    Dark Mode
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Toggle between light and dark theme
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

                {/* Editor Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Editor
                        </CardTitle>
                        <CardDescription>
                            Configure the roadmap editor behavior
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="ai-panel" className="font-medium">
                                    AI Panel
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Show AI assistant panel by default
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

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Manage your notification preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notif" className="font-medium">
                                    Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates about your learning progress
                                </p>
                            </div>
                            <Switch
                                id="email-notif"
                                disabled
                                checked={false}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Coming soon
                        </p>
                    </CardContent>
                </Card>

                <Separator />

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-medium">Delete Account</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            account and remove all your data including projects, roadmaps,
                                            and quiz results.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <div className="text-center text-sm text-muted-foreground pt-4">
                    <p>Logged in as <span className="font-medium">{user?.email}</span></p>
                </div>
            </div>
        </div>
    );
}
