import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FolderPlus } from "lucide-react";

interface SaveProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTitle?: string;
    onSave: (title: string) => Promise<void>;
}

export function SaveProjectDialog({
    open,
    onOpenChange,
    defaultTitle = "My Roadmap",
    onSave,
}: SaveProjectDialogProps) {
    const [title, setTitle] = useState(defaultTitle);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        
        setIsLoading(true);
        try {
            await onSave(title.trim());
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading && title.trim()) {
            handleSave();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5" />
                        Simpan sebagai Project Baru
                    </DialogTitle>
                    <DialogDescription>
                        Roadmap akan disimpan ke project baru. Masukkan nama project.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="project-name" className="text-sm font-medium">
                        Nama Project
                    </Label>
                    <Input
                        id="project-name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: Belajar Frontend"
                        className="mt-2"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !title.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Project"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
