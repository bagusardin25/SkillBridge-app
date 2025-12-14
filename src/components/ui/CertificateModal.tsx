import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
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
            // Convert to PNG first
            const dataUrl = await toPng(certificateRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
            });

            // Create PDF (A4 landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to PDF (full page)
            const imgWidth = 297; // A4 landscape width in mm
            const imgHeight = 210; // A4 landscape height in mm
            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);

            // Download PDF
            pdf.save(`certificate-${roadmapTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);

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
            <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Celebration Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6 text-primary-foreground text-center flex-shrink-0">
                    <div className="flex justify-center mb-2 sm:mb-3">
                        <div className="relative">
                            <Award className="h-10 w-10 sm:h-16 sm:w-16" />
                            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">🎉 Selamat!</h2>
                    <p className="text-primary-foreground/80 text-sm sm:text-base">Kamu telah menyelesaikan roadmap ini!</p>
                </div>

                {/* Certificate Preview - scrollable */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    <div 
                        ref={certificateRef}
                        className="bg-white border-4 sm:border-8 border-double border-primary/20 rounded-lg p-4 sm:p-8 text-center"
                        style={{ aspectRatio: '1.414/1' }}
                    >
                        {/* Certificate Content */}
                        <div className="h-full flex flex-col justify-between">
                            {/* Header */}
                            <div>
                                <div className="flex justify-center mb-2 sm:mb-4">
                                    <Award className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                                </div>
                                <h1 className="text-lg sm:text-3xl font-serif font-bold text-gray-800 mb-1 sm:mb-2">
                                    Certificate of Completion
                                </h1>
                                <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-primary mx-auto mb-2 sm:mb-4"></div>
                                <p className="text-gray-500 text-xs sm:text-sm">This is to certify that</p>
                            </div>

                            {/* Name */}
                            <div className="my-2 sm:my-4">
                                <h2 className="text-lg sm:text-2xl font-bold text-primary font-serif">
                                    {userName || "Learner"}
                                </h2>
                            </div>

                            {/* Achievement */}
                            <div className="my-2 sm:my-4">
                                <p className="text-gray-600 mb-1 sm:mb-2 text-xs sm:text-base">has successfully completed the learning roadmap</p>
                                <h3 className="text-sm sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                                    "{roadmapTitle}"
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Covering {completedTopics} topics
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-2 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-end text-[10px] sm:text-base">
                                    <div className="text-left">
                                        <p className="text-gray-400 text-[8px] sm:text-xs">Date of Completion</p>
                                        <p className="font-medium text-gray-600 text-[10px] sm:text-sm">{formatDate(completionDate)}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm sm:text-xl font-bold text-primary">SkillBridge</div>
                                        <p className="text-gray-400 text-[8px] sm:text-xs">AI-Powered Learning Platform</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-[8px] sm:text-xs">Certificate ID</p>
                                        <p className="font-mono text-gray-600 text-[10px] sm:text-sm">
                                            {certificateId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions - sticky at bottom */}
                <div className="p-3 sm:p-4 border-t bg-muted/30 flex justify-between items-center flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Close</span>
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading} size="sm">
                        {isDownloading ? (
                            <span className="animate-spin mr-1 sm:mr-2">⏳</span>
                        ) : (
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                        )}
                        <span className="hidden sm:inline">Download Certificate</span>
                        <span className="sm:hidden">Download</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
