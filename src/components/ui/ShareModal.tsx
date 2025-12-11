import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Globe, Lock, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roadmapId: string | null;
    roadmapTitle: string;
    isPublic?: boolean;
    onTogglePublic?: (isPublic: boolean) => Promise<void>;
}

export function ShareModal({
    open,
    onOpenChange,
    roadmapId,
    roadmapTitle,
    isPublic = false,
    onTogglePublic,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [publicState, setPublicState] = useState(isPublic);

    const shareUrl = roadmapId 
        ? `${window.location.origin}/share/${roadmapId}`
        : '';

    const handleCopy = async () => {
        if (!shareUrl) {
            toast.error("No roadmap to share");
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleTogglePublic = async (checked: boolean) => {
        if (!onTogglePublic) {
            // For now, just toggle the local state
            setPublicState(checked);
            toast.info(checked ? "Roadmap is now public" : "Roadmap is now private");
            return;
        }

        setIsToggling(true);
        try {
            await onTogglePublic(checked);
            setPublicState(checked);
            toast.success(checked ? "Roadmap is now public" : "Roadmap is now private");
        } catch {
            toast.error("Failed to update sharing settings");
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Share Roadmap
                    </DialogTitle>
                    <DialogDescription>
                        Share "{roadmapTitle}" with others
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Public Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                            {publicState ? (
                                <Globe className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                                <Label htmlFor="public-toggle" className="font-medium">
                                    {publicState ? "Public" : "Private"}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {publicState 
                                        ? "Anyone with the link can view" 
                                        : "Only you can access this roadmap"
                                    }
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="public-toggle"
                            checked={publicState}
                            onCheckedChange={handleTogglePublic}
                            disabled={isToggling || !roadmapId}
                        />
                    </div>

                    {/* Share Link */}
                    {publicState && roadmapId && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="bg-muted"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Share this link with anyone you want to view your roadmap
                            </p>
                        </div>
                    )}

                    {/* Not Saved Warning */}
                    {!roadmapId && (
                        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            <p className="text-sm">
                                Save your roadmap first before sharing
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
