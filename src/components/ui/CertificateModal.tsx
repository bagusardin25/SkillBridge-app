import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CertificateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    roadmapTitle: string;
    completedTopics: number;
    completionDate: Date;
    roadmapId?: string;
}

// Generate deterministic certificate ID based on roadmapId and completion date
function generateCertificateId(roadmapId: string | undefined, completionDate: Date): string {
    const dateStr = completionDate.toISOString().split('T')[0].replace(/-/g, '');
    const hash = roadmapId ? roadmapId.slice(-6).toUpperCase() : 'XXXXXX';
    return `SB-${dateStr}-${hash}`;
}

export function CertificateModal({
    open,
    onOpenChange,
    userName,
    roadmapTitle,
    completedTopics,
    completionDate,
    roadmapId,
}: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const certificateId = generateCertificateId(roadmapId, completionDate);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(certificateRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `certificate-${roadmapTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Certificate downloaded!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download certificate");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                {/* Celebration Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground text-center">
                    <div className="flex justify-center mb-3">
                        <div className="relative">
                            <Award className="h-16 w-16" />
                            <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">🎉 Selamat!</h2>
                    <p className="text-primary-foreground/80">Kamu telah menyelesaikan roadmap ini!</p>
                </div>

                {/* Certificate Preview */}
                <div className="p-6">
                    <div 
                        ref={certificateRef}
                        className="bg-white border-8 border-double border-primary/20 rounded-lg p-8 text-center"
                        style={{ aspectRatio: '1.414/1' }}
                    >
                        {/* Certificate Content */}
                        <div className="h-full flex flex-col justify-between">
                            {/* Header */}
                            <div>
                                <div className="flex justify-center mb-4">
                                    <Award className="h-12 w-12 text-primary" />
                                </div>
                                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                                    Certificate of Completion
                                </h1>
                                <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
                                <p className="text-gray-500 text-sm">This is to certify that</p>
                            </div>

                            {/* Name */}
                            <div className="my-4">
                                <h2 className="text-2xl font-bold text-primary font-serif">
                                    {userName || "Learner"}
                                </h2>
                            </div>

                            {/* Achievement */}
                            <div className="my-4">
                                <p className="text-gray-600 mb-2">has successfully completed the learning roadmap</p>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    "{roadmapTitle}"
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Covering {completedTopics} topics
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400">Date of Completion</p>
                                        <p className="text-sm font-medium text-gray-600">{formatDate(completionDate)}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-primary">SkillBridge</div>
                                        <p className="text-xs text-gray-400">AI-Powered Learning Platform</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Certificate ID</p>
                                        <p className="text-sm font-mono text-gray-600">
                                            {certificateId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Close
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Download Certificate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
