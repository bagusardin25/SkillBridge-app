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

// Logo component for certificate (inline SVG for PDF export compatibility)
function CertificateLogo({ size = 40 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
        >
            <rect width="100" height="100" rx="20" fill="#1a1a1a" />
            <path
                d="M30 70 L50 30 L70 70"
                stroke="#8B5CF6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="50" cy="25" r="5" fill="#8B5CF6" />
        </svg>
    );
}

// Corner ornament component
function CornerOrnament({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
    const rotations = {
        'top-left': 'rotate-0',
        'top-right': 'rotate-90',
        'bottom-right': 'rotate-180',
        'bottom-left': '-rotate-90'
    };

    const positions = {
        'top-left': 'top-1 left-1 sm:top-2 sm:left-2',
        'top-right': 'top-1 right-1 sm:top-2 sm:right-2',
        'bottom-left': 'bottom-1 left-1 sm:bottom-2 sm:left-2',
        'bottom-right': 'bottom-1 right-1 sm:bottom-2 sm:right-2'
    };

    return (
        <div className={`absolute ${positions[position]} ${rotations[position]}`}>
            <svg width="24" height="24" viewBox="0 0 40 40" className="w-4 h-4 sm:w-6 sm:h-6">
                <path
                    d="M5 5 L5 20 Q5 5 20 5 L5 5"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="2" fill="#8B5CF6" />
            </svg>
        </div>
    );
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

            // Add image to PDF with proper aspect ratio
            const imgWidth = 297; // A4 landscape width in mm
            const imgHeight = 210; // A4 landscape height in mm

            // Get actual image dimensions to maintain aspect ratio
            const img = new Image();
            img.src = dataUrl;
            await new Promise(resolve => img.onload = resolve);

            const imgAspectRatio = img.width / img.height;
            const pageAspectRatio = imgWidth / imgHeight;

            let finalWidth = imgWidth;
            let finalHeight = imgHeight;
            let xOffset = 0;
            let yOffset = 0;

            if (imgAspectRatio > pageAspectRatio) {
                // Image is wider - fit to width
                finalHeight = imgWidth / imgAspectRatio;
                yOffset = (imgHeight - finalHeight) / 2;
            } else {
                // Image is taller - fit to height
                finalWidth = imgHeight * imgAspectRatio;
                xOffset = (imgWidth - finalWidth) / 2;
            }

            pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

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
            <DialogContent className="w-[95vw] max-w-3xl p-0 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-lg">
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
                <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-gray-50">
                    <div
                        ref={certificateRef}
                        className="bg-white border-2 sm:border-4 border-purple-200 rounded-lg p-4 sm:p-8 text-center relative shadow-lg"
                    >
                        {/* Corner Ornaments */}
                        <CornerOrnament position="top-left" />
                        <CornerOrnament position="top-right" />
                        <CornerOrnament position="bottom-left" />
                        <CornerOrnament position="bottom-right" />

                        {/* Certificate Content */}
                        <div className="flex flex-col justify-between gap-3 sm:gap-5 py-2 sm:py-4">
                            {/* Header with Logo */}
                            <div>
                                <div className="flex justify-center items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                                    <CertificateLogo size={32} />
                                    <span className="text-lg sm:text-2xl font-bold text-gray-800">SkillBridge</span>
                                </div>
                                <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-800 mb-1 sm:mb-2">
                                    Certificate of Completion
                                </h1>
                                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                                    <div className="w-8 sm:w-16 h-0.5 bg-purple-300"></div>
                                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                    <div className="w-8 sm:w-16 h-0.5 bg-purple-300"></div>
                                </div>
                                <p className="text-gray-500 text-xs sm:text-sm">This is to certify that</p>
                            </div>

                            {/* Name */}
                            <div className="my-1 sm:my-3">
                                <h2 className="text-xl sm:text-3xl font-bold text-purple-600 font-serif tracking-wide">
                                    {userName || "Learner"}
                                </h2>
                                <div className="w-32 sm:w-48 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mt-1 sm:mt-2"></div>
                            </div>

                            {/* Achievement */}
                            <div className="my-1 sm:my-2">
                                <p className="text-gray-600 mb-1 sm:mb-2 text-xs sm:text-base">has successfully completed the learning roadmap</p>
                                <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2 px-2">
                                    "{roadmapTitle}"
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Covering {completedTopics} topics
                                </p>
                            </div>

                            {/* Footer with Signature */}
                            <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-end text-[10px] sm:text-sm">
                                    <div className="text-left flex-1">
                                        <p className="text-gray-400 text-[8px] sm:text-xs mb-1">Date of Completion</p>
                                        <p className="font-medium text-gray-700">{formatDate(completionDate)}</p>
                                    </div>

                                    {/* Signature Area */}
                                    <div className="text-center flex-1">
                                        <div className="border-b border-gray-400 w-20 sm:w-32 mx-auto mb-1"></div>
                                        <p className="text-[8px] sm:text-xs text-gray-500 font-medium">SkillBridge AI</p>
                                        <p className="text-[7px] sm:text-[10px] text-gray-400">Learning Platform</p>
                                    </div>

                                    <div className="text-right flex-1">
                                        <p className="text-gray-400 text-[8px] sm:text-xs mb-1">Certificate ID</p>
                                        <p className="font-mono text-gray-700 text-[9px] sm:text-xs">
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

