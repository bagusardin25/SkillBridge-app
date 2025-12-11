import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BadgesSection } from "@/components/ui/BadgesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BarChart3, 
    CheckCircle2, 
    Clock, 
    Folder, 
    Target,
    TrendingUp,
    Award,
    Flame,
    Calendar,
    Trophy
} from "lucide-react";
import type { UserStats } from "@/data/badges";

interface ProjectStats {
    id: string;
    title: string;
    totalNodes: number;
    completedNodes: number;
}

interface ProgressDashboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: ProjectStats[];
    currentProjectStats: {
        totalNodes: number;
        completedNodes: number;
        title: string;
    } | null;
    streakData?: {
        currentStreak: number;
        bestStreak: number;
        lastActiveDate: string | null;
        weeklyActivity: number[]; // topics completed per day (last 7 days)
    };
    userProfile?: {
        quizzesPassed: number;
        xp: number;
        level: number;
    };
}

export function ProgressDashboard({
    open,
    onOpenChange,
    projects,
    currentProjectStats,
    streakData = { currentStreak: 0, bestStreak: 0, lastActiveDate: null, weeklyActivity: [0,0,0,0,0,0,0] },
    userProfile = { quizzesPassed: 0, xp: 0, level: 1 },
}: ProgressDashboardProps) {
    // Calculate overall stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => 
        p.totalNodes > 0 && p.completedNodes === p.totalNodes
    ).length;
    const inProgressProjects = projects.filter(p => 
        p.totalNodes > 0 && p.completedNodes > 0 && p.completedNodes < p.totalNodes
    ).length;
    
    const totalTopics = projects.reduce((sum, p) => sum + p.totalNodes, 0);
    const completedTopics = projects.reduce((sum, p) => sum + p.completedNodes, 0);
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const currentProgress = currentProjectStats && currentProjectStats.totalNodes > 0
        ? Math.round((currentProjectStats.completedNodes / currentProjectStats.totalNodes) * 100)
        : 0;

    // User stats for badges
    const userStats: UserStats = {
        completedTopics,
        completedRoadmaps: completedProjects,
        currentStreak: streakData.currentStreak,
        bestStreak: streakData.bestStreak,
        lastActiveDate: streakData.lastActiveDate,
        quizzesPassed: userProfile.quizzesPassed,
        xp: userProfile.xp,
        level: userProfile.level,
    };

    // Weekly activity stats
    const topicsThisWeek = streakData.weeklyActivity.reduce((a, b) => a + b, 0);
    const maxDailyActivity = Math.max(...streakData.weeklyActivity, 1);
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Progress Dashboard
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="gap-2">
                            <Trophy className="h-4 w-4" />
                            Achievements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-6 mt-4">
                        {/* Current Project Progress */}
                        {currentProjectStats && currentProjectStats.totalNodes > 0 && (
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Current Roadmap
                                </h3>
                                <p className="font-semibold mb-3">{currentProjectStats.title}</p>
                                <div className="flex items-center gap-4">
                                    <Progress value={currentProgress} className="flex-1 h-3" />
                                    <span className={`text-lg font-bold ${currentProgress === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                                        {currentProgress}%
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {currentProjectStats.completedNodes} of {currentProjectStats.totalNodes} topics completed
                                </p>
                            </div>
                        )}

                        {/* Streak & Weekly Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Streak Card */}
                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span className="font-medium">Learning Streak</span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-orange-500">
                                        {streakData.currentStreak}
                                    </span>
                                    <span className="text-muted-foreground">hari</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Best: {streakData.bestStreak} hari
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Activity */}
                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-500" />
                                        <span className="font-medium">Aktivitas Minggu Ini</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{topicsThisWeek} topics</span>
                                </div>
                                <div className="flex items-end gap-1 h-16">
                                    {streakData.weeklyActivity.map((count, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div 
                                                className="w-full bg-primary/20 rounded-t transition-all"
                                                style={{ 
                                                    height: `${(count / maxDailyActivity) * 100}%`,
                                                    minHeight: count > 0 ? '4px' : '0px',
                                                    backgroundColor: count > 0 ? 'hsl(var(--primary))' : undefined,
                                                    opacity: count > 0 ? 0.3 + (count / maxDailyActivity) * 0.7 : 0.2,
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">{dayNames[i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<Folder className="h-5 w-5" />}
                                label="Total Projects"
                                value={totalProjects}
                                color="text-blue-500"
                                bgColor="bg-blue-500/10"
                            />
                            <StatCard
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                label="Completed"
                                value={completedProjects}
                                color="text-emerald-500"
                                bgColor="bg-emerald-500/10"
                            />
                            <StatCard
                                icon={<Clock className="h-5 w-5" />}
                                label="In Progress"
                                value={inProgressProjects}
                                color="text-amber-500"
                                bgColor="bg-amber-500/10"
                            />
                            <StatCard
                                icon={<Target className="h-5 w-5" />}
                                label="Topics Done"
                                value={completedTopics}
                                color="text-violet-500"
                                bgColor="bg-violet-500/10"
                            />
                        </div>

                        {/* Overall Progress */}
                        <div className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">Overall Learning Progress</span>
                                </div>
                                <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-3" />
                            <p className="text-sm text-muted-foreground mt-2">
                                {completedTopics} topics completed across all projects
                            </p>
                        </div>

                        {/* Empty State */}
                        {totalProjects === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No projects yet. Start your learning journey!</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="achievements" className="flex-1 overflow-y-auto space-y-6 mt-4">
                        {/* Badges Section */}
                        <BadgesSection stats={userStats} />

                        {/* Achievement Summary */}
                        {completedProjects > 0 && (
                            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-3">
                                    <Award className="h-8 w-8 text-amber-500" />
                                    <div>
                                        <h4 className="font-semibold">
                                            🎉 {completedProjects} Roadmap{completedProjects > 1 ? 's' : ''} Completed!
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            You've earned {completedProjects} certificate{completedProjects > 1 ? 's' : ''}. Keep learning!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Streak Achievement */}
                        {streakData.currentStreak >= 3 && (
                            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                                <div className="flex items-center gap-3">
                                    <Flame className="h-8 w-8 text-orange-500" />
                                    <div>
                                        <h4 className="font-semibold">
                                            🔥 {streakData.currentStreak} Day Streak!
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            You're on fire! Keep the momentum going.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty achievements state */}
                        {completedTopics === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Complete topics to earn badges!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function StatCard({ 
    icon, 
    label, 
    value, 
    color, 
    bgColor 
}: { 
    icon: React.ReactNode; 
    label: string; 
    value: number; 
    color: string; 
    bgColor: string;
}) {
    return (
        <div className="p-4 rounded-lg border bg-card">
            <div className={`inline-flex p-2 rounded-lg ${bgColor} ${color} mb-2`}>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}
