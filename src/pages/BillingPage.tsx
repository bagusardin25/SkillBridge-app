import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfile, type ProfileResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    X,
    Check,
    Sparkles,
    Crown,
    Building2,
    Zap,
    FolderOpen,
    GraduationCap,
    Loader2,
} from "lucide-react";

const PLANS = [
    {
        id: "FREE",
        name: "Free",
        price: "Rp 0",
        period: "forever",
        description: "Perfect for getting started",
        icon: Zap,
        features: [
            "Up to 3 projects",
            "Basic AI roadmap generation",
            "Quiz system",
            "Community support",
        ],
        highlighted: false,
    },
    {
        id: "PRO",
        name: "Pro",
        price: "Rp 99.000",
        period: "/month",
        description: "For serious learners",
        icon: Crown,
        features: [
            "Unlimited projects",
            "Priority AI generation",
            "Advanced analytics",
            "Export to PDF",
            "Email support",
            "No ads",
        ],
        highlighted: true,
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For teams & organizations",
        icon: Building2,
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Custom integrations",
            "SSO authentication",
            "Dedicated support",
            "Custom branding",
        ],
        highlighted: false,
    },
];

export function BillingPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const data = await getProfile(user.id);
                setProfileData(data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const handleUpgrade = (planId: string) => {
        if (planId === "ENTERPRISE") {
            toast.info("Hubungi kami di support@skillbridge.id untuk paket Enterprise");
        } else if (planId === "PRO") {
            toast.info("Fitur pembayaran akan segera tersedia!");
        }
    };

    const currentTier = user?.tier || "FREE";

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-[60] h-14 border-b bg-background flex items-center justify-between px-4">
                <h1 className="text-lg font-semibold">Billing</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Current Plan */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Current Plan</CardTitle>
                                <CardDescription>Your active subscription</CardDescription>
                            </div>
                            <Badge 
                                variant="secondary" 
                                className={`text-base px-4 py-1 ${
                                    currentTier === "PRO" 
                                        ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/50" 
                                        : currentTier === "ENTERPRISE"
                                        ? "bg-purple-500/20 text-purple-600 border-purple-500/50"
                                        : ""
                                }`}
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                {currentTier}
                            </Badge>
                        </div>
                    </CardHeader>
                    {!isLoading && profileData && (
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-background rounded-lg">
                                    <FolderOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{profileData.stats.totalProjects}</p>
                                    <p className="text-xs text-muted-foreground">Projects</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg">
                                    <GraduationCap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{profileData.stats.totalQuizzesPassed}</p>
                                    <p className="text-xs text-muted-foreground">Quizzes Passed</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg">
                                    <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{profileData.user.xp}</p>
                                    <p className="text-xs text-muted-foreground">Total XP</p>
                                </div>
                                <div className="text-center p-3 bg-background rounded-lg">
                                    <Crown className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                    <p className="text-2xl font-bold">Lv.{profileData.user.level}</p>
                                    <p className="text-xs text-muted-foreground">Level</p>
                                </div>
                            </div>
                        </CardContent>
                    )}
                    {isLoading && (
                        <CardContent className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </CardContent>
                    )}
                </Card>

                {/* Beta Notice */}
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <p className="text-sm font-medium">🚧 Fitur Dalam Pengembangan</p>
                    <p className="text-sm mt-1">
                        Sistem pembayaran dan upgrade plan belum tersedia. 
                        Saat ini semua pengguna dapat mengakses fitur Pro secara gratis selama masa beta.
                    </p>
                </div>

                {/* Plans */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLANS.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = currentTier === plan.id;
                            
                            return (
                                <Card 
                                    key={plan.id}
                                    className={`relative ${
                                        plan.highlighted 
                                            ? "border-primary shadow-lg scale-[1.02]" 
                                            : ""
                                    } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                                >
                                    {plan.highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-primary text-primary-foreground">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="text-center pb-2">
                                        <div className={`h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                                            plan.id === "PRO" 
                                                ? "bg-yellow-500/20" 
                                                : plan.id === "ENTERPRISE"
                                                ? "bg-purple-500/20"
                                                : "bg-primary/10"
                                        }`}>
                                            <Icon className={`h-6 w-6 ${
                                                plan.id === "PRO"
                                                    ? "text-yellow-600"
                                                    : plan.id === "ENTERPRISE"
                                                    ? "text-purple-600"
                                                    : "text-primary"
                                            }`} />
                                        </div>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                        <div className="pt-2">
                                            <span className="text-3xl font-bold">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.period}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            className="w-full"
                                            variant={isCurrentPlan ? "outline" : plan.highlighted ? "default" : "secondary"}
                                            disabled={isCurrentPlan}
                                            onClick={() => handleUpgrade(plan.id)}
                                        >
                                            {isCurrentPlan ? "Current Plan" : plan.id === "ENTERPRISE" ? "Contact Sales" : "Upgrade"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium">Bagaimana cara upgrade ke Pro?</p>
                            <p className="text-sm text-muted-foreground">
                                Fitur pembayaran akan segera tersedia. Saat ini semua fitur Pro dapat diakses secara gratis selama masa beta.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">Apakah ada trial untuk Pro?</p>
                            <p className="text-sm text-muted-foreground">
                                Ya! Selama masa beta, semua pengguna mendapatkan akses ke fitur Pro secara gratis.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">Bagaimana dengan Enterprise?</p>
                            <p className="text-sm text-muted-foreground">
                                Hubungi tim kami di support@skillbridge.id untuk mendiskusikan kebutuhan tim atau organisasi Anda.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
