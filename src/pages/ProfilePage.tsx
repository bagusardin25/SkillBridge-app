import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { getProfile, getProject, updateProfile, getQuizResultsForRoadmap, type ProfileResponse, type ProjectWithStats, type UserProfile } from "@/lib/api";
import { mergeNodesWithQuizResults } from "@/lib/roadmapUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    MapPin,
    Calendar,
    Edit2,
    Clock,
    Trophy,
    Zap,
    X,
    FolderOpen,
    CheckCircle2,
    Target,
    Mail,
    Sparkles,
    Loader2,
    Flame
} from "lucide-react";
import { BadgesSection } from "@/components/ui/BadgesSection";
import type { UserStats } from "@/data/badges";



export function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { setNodes, setEdges, setCurrentProject, setCurrentRoadmapId, clearRoadmap } = useRoadmapStore();
    const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const fetchProfile = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const data = await getProfile(user.id);
            setProfileData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleProfileUpdated = (updatedUser: UserProfile) => {
        if (profileData) {
            setProfileData({
                ...profileData,
                user: updatedUser
            });
        }
        setIsEditDialogOpen(false);
        toast.success("Profile updated successfully!");
    };

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    const handleNavigateToProject = async (projectId: string, projectTitle: string) => {
        try {
            const project = await getProject(projectId);

            if (project.roadmaps && project.roadmaps.length > 0) {
                const roadmap = project.roadmaps[0];
                let nodes = Array.isArray(roadmap.nodes) ? roadmap.nodes : [];
                const edges = Array.isArray(roadmap.edges) ? roadmap.edges : [];

                // Fetch quiz results and merge with nodes to restore completion status
                if (user?.id) {
                    const quizResults = await getQuizResultsForRoadmap(roadmap.id, user.id);
                    nodes = mergeNodesWithQuizResults(nodes, quizResults);
                }

                setNodes(nodes);
                setEdges(edges);
                setCurrentRoadmapId(roadmap.id);
            } else {
                clearRoadmap();
            }

            setCurrentProject(projectId, projectTitle);
            navigate("/app");
        } catch (error) {
            console.error("Failed to load project:", error);
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error || !profileData) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <X className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Failed to Load Profile</h2>
                        <p className="text-muted-foreground mb-4">{error || "Something went wrong"}</p>
                    </div>
                    <Button onClick={() => navigate("/app")} variant="outline">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    const { user: profile, projects, stats } = profileData;

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-[60] h-14 border-b bg-background flex items-center justify-between px-4">
                <h1 className="text-lg font-semibold">Profile</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2">
                                    <AvatarImage src={profile.avatarUrl || ""} alt={profile.name || "User"} className="object-cover" />
                                    <AvatarFallback className="text-2xl sm:text-3xl bg-primary/10 text-primary font-bold">
                                        {getInitials(profile.name, profile.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={() => setIsEditDialogOpen(true)}
                                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                                    <h2 className="text-2xl sm:text-3xl font-bold">{profile.name || "User"}</h2>
                                    <Badge variant="secondary" className={`
                                        ${profile.tier === "PRO" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50" :
                                            profile.tier === "ENTERPRISE" ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50" :
                                                "bg-secondary text-secondary-foreground"}
                                    `}>
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {profile.tier}
                                    </Badge>
                                </div>
                                <p className="text-base text-muted-foreground font-medium">{profile.jobRole || "Learner"}</p>
                                <p className="text-sm text-muted-foreground">{profile.bio || "No bio yet. Click edit to add one!"}</p>

                                {/* Info Pills */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{profile.location || "Not set"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Joined {new Date(profile.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {/* Streak Card */}
                    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Streak</span>
                                </div>
                                <span className="text-2xl font-bold">{profile.currentStreak}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {profile.currentStreak === 0 ? "Start learning today!" :
                                    profile.currentStreak === profile.longestStreak ? "Personal best!" :
                                        `Best: ${profile.longestStreak} days`}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Learning Hours Card */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Hours</span>
                                </div>
                                <span className="text-2xl font-bold">{Math.floor(profile.totalLearningMinutes / 60)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {profile.totalLearningMinutes === 0 ? "Start your journey!" :
                                    `${profile.totalLearningMinutes % 60}m more this session`}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Level Card */}
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Level</span>
                                </div>
                                <span className="text-2xl font-bold">{profile.level}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {profile.xp.toLocaleString()} XP total
                            </p>
                        </CardContent>
                    </Card>

                    {/* Quizzes Card */}
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Quizzes</span>
                                </div>
                                <span className="text-2xl font-bold">{stats.totalQuizzesPassed}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {stats.totalQuizzesTaken > 0
                                    ? `${Math.round((stats.totalQuizzesPassed / stats.totalQuizzesTaken) * 100)}% pass rate`
                                    : "Complete quizzes to track"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="learning-path" className="w-full">
                    <TabsList className="bg-secondary/30 p-1 border mb-6 w-full sm:w-auto">
                        <TabsTrigger value="learning-path" className="flex-1 sm:flex-none px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <FolderOpen className="w-4 h-4 mr-2 hidden sm:inline" />
                            Learning Path
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="flex-1 sm:flex-none px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Trophy className="w-4 h-4 mr-2 hidden sm:inline" />
                            Achievements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="learning-path" className="mt-0 animate-in fade-in-50 duration-300">
                        {projects.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <FolderOpen className="h-10 w-10 text-primary/60" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No Learning Projects Yet</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm">
                                        Start your learning journey by creating a roadmap. We'll track your progress here!
                                    </p>
                                    <Button onClick={() => navigate("/app")} size="lg">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Create Your First Roadmap
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {projects.map((project, index) => (
                                    <div
                                        key={project.id}
                                        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <ProjectCard project={project} onNavigate={() => handleNavigateToProject(project.id, project.title)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card>
                            <CardContent className="p-6">
                                <BadgesSection
                                    stats={{
                                        completedTopics: stats.totalCompletedTopics,
                                        completedRoadmaps: stats.totalCompletedRoadmaps,
                                        currentStreak: profile.currentStreak,
                                        bestStreak: profile.longestStreak,
                                        lastActiveDate: profile.lastActiveDate ? new Date(profile.lastActiveDate).toISOString() : null,
                                        quizzesPassed: stats.totalQuizzesPassed,
                                        xp: profile.xp,
                                        level: profile.level,
                                    } as UserStats}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Profile Dialog */}
            <EditProfileDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                profile={profile}
                userId={user?.id || ""}
                onProfileUpdated={handleProfileUpdated}
            />
        </div>
    );
}

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    userId: string;
    onProfileUpdated: (user: UserProfile) => void;
}

function EditProfileDialog({ isOpen, onClose, profile, userId, onProfileUpdated }: EditProfileDialogProps) {
    const updateUser = useAuthStore((state) => state.updateUser);
    const [formData, setFormData] = useState({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        jobRole: profile.jobRole || "",
        avatarUrl: profile.avatarUrl || "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: profile.name || "",
                bio: profile.bio || "",
                location: profile.location || "",
                jobRole: profile.jobRole || "",
                avatarUrl: profile.avatarUrl || "",
            });
        }
    }, [isOpen, profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const updatedUser = await updateProfile(userId, {
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                jobRole: formData.jobRole,
                avatarUrl: formData.avatarUrl,
            });
            // Sync to auth store for sidebar and chat
            updateUser({
                name: updatedUser.name,
                avatarUrl: updatedUser.avatarUrl,
            });
            onProfileUpdated(updatedUser);
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string, email: string) => {
        if (name) {
            return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Preview */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2">
                            <AvatarImage src={formData.avatarUrl} alt="Preview" />
                            <AvatarFallback className="bg-gradient-to-br from-gray-800 to-black text-white">
                                {getInitials(formData.name, profile.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatarUrl" className="text-xs text-muted-foreground">
                                Avatar URL
                            </Label>
                            <Input
                                id="avatarUrl"
                                placeholder="https://example.com/avatar.jpg"
                                value={formData.avatarUrl}
                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Job Role */}
                    <div className="space-y-2">
                        <Label htmlFor="jobRole">Job Role</Label>
                        <Input
                            id="jobRole"
                            placeholder="e.g. Frontend Developer, Student"
                            value={formData.jobRole}
                            onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="e.g. Jakarta, Indonesia"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ProfileSkeleton() {
    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-[60] h-14 border-b bg-background flex items-center justify-between px-4">
                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Card Skeleton */}
                <div className="border rounded-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-muted animate-pulse"></div>
                        <div className="flex-1 text-center sm:text-left space-y-3">
                            <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto sm:mx-0"></div>
                            <div className="h-5 w-32 bg-muted rounded animate-pulse mx-auto sm:mx-0"></div>
                            <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto sm:mx-0"></div>
                        </div>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="h-10 w-64 bg-muted rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface ProjectCardProps {
    project: ProjectWithStats;
    onNavigate: () => void;
}

function ProjectCard({ project, onNavigate }: ProjectCardProps) {
    const totalRoadmaps = project.roadmaps.length;

    return (
        <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 bg-card hover:-translate-y-1">
            <div className="relative h-28 sm:h-32 overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10"></div>
                <div className="absolute top-3 left-3 z-20">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none text-xs font-normal">
                        {totalRoadmaps} Roadmap{totalRoadmaps !== 1 ? "s" : ""}
                    </Badge>
                </div>
                <div className="absolute bottom-3 left-3 z-20">
                    <div className="flex items-center gap-1 text-foreground/90 text-sm font-medium">
                        <Target className="h-4 w-4 text-primary" />
                        <span>{project.completedNodes}/{project.totalNodes} nodes</span>
                    </div>
                </div>
            </div>
            <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.overallProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${project.overallProgress === 100
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                                    }`}
                                style={{ width: `${project.overallProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t">
                        <Badge variant="outline" className={`text-xs font-normal ${project.overallProgress === 100
                            ? "border-green-500/50 text-green-600 bg-green-500/10"
                            : project.overallProgress > 0
                                ? "border-blue-500/50 text-blue-600 bg-blue-500/10"
                                : ""
                            }`}>
                            {project.overallProgress === 100 ? "Completed" :
                                project.overallProgress > 0 ? "In Progress" : "Not Started"}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-primary/10 hover:text-primary" onClick={onNavigate}>
                            Continue
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

