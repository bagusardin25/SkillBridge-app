export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: {
        type: 'topics' | 'roadmaps' | 'streak' | 'quizzes' | 'xp' | 'level';
        value: number;
    };
    color: string;
    bgColor: string;
    category: 'topic' | 'roadmap' | 'streak' | 'achievement';
}

export const badges: Badge[] = [
    // Topic-based badges
    {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first topic',
        icon: '🌟',
        condition: { type: 'topics', value: 1 },
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        category: 'topic',
    },
    {
        id: 'quick-starter',
        name: 'Quick Starter',
        description: 'Complete 5 topics',
        icon: '🚀',
        condition: { type: 'topics', value: 5 },
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        category: 'topic',
    },
    {
        id: 'knowledge-seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 10 topics',
        icon: '📚',
        condition: { type: 'topics', value: 10 },
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        category: 'topic',
    },
    {
        id: 'topic-master',
        name: 'Topic Master',
        description: 'Complete 25 topics',
        icon: '🎯',
        condition: { type: 'topics', value: 25 },
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        category: 'topic',
    },
    {
        id: 'learning-machine',
        name: 'Learning Machine',
        description: 'Complete 50 topics',
        icon: '🤖',
        condition: { type: 'topics', value: 50 },
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
        category: 'topic',
    },

    // Roadmap-based badges
    {
        id: 'roadmap-master',
        name: 'Roadmap Master',
        description: 'Complete your first roadmap',
        icon: '🏆',
        condition: { type: 'roadmaps', value: 1 },
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        category: 'roadmap',
    },
    {
        id: 'learning-champion',
        name: 'Learning Champion',
        description: 'Complete 3 roadmaps',
        icon: '👑',
        condition: { type: 'roadmaps', value: 3 },
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        category: 'roadmap',
    },
    {
        id: 'skill-legend',
        name: 'Skill Legend',
        description: 'Complete 5 roadmaps',
        icon: '⭐',
        condition: { type: 'roadmaps', value: 5 },
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        category: 'roadmap',
    },

    // Streak-based badges
    {
        id: 'on-fire',
        name: 'On Fire',
        description: 'Maintain a 3-day learning streak',
        icon: '🔥',
        condition: { type: 'streak', value: 3 },
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        category: 'streak',
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 7-day learning streak',
        icon: '⚡',
        condition: { type: 'streak', value: 7 },
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        category: 'streak',
    },
    {
        id: 'dedicated-learner',
        name: 'Dedicated Learner',
        description: 'Maintain a 14-day learning streak',
        icon: '💎',
        condition: { type: 'streak', value: 14 },
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10',
        category: 'streak',
    },
    {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Maintain a 30-day learning streak',
        icon: '👑',
        condition: { type: 'streak', value: 30 },
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10',
        category: 'streak',
    },

    // Quiz & Achievement badges
    {
        id: 'quiz-rookie',
        name: 'Quiz Rookie',
        description: 'Pass 5 quizzes',
        icon: '✅',
        condition: { type: 'quizzes', value: 5 },
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        category: 'achievement',
    },
    {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Pass 10 quizzes',
        icon: '🧠',
        condition: { type: 'quizzes', value: 10 },
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        category: 'achievement',
    },
    {
        id: 'xp-hunter',
        name: 'XP Hunter',
        description: 'Earn 1000 XP',
        icon: '💰',
        condition: { type: 'xp', value: 1000 },
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        category: 'achievement',
    },
    {
        id: 'elite-learner',
        name: 'Elite Learner',
        description: 'Reach Level 10',
        icon: '🌟',
        condition: { type: 'level', value: 10 },
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        category: 'achievement',
    },
];

export interface UserStats {
    completedTopics: number;
    completedRoadmaps: number;
    currentStreak: number;
    bestStreak: number;
    lastActiveDate: string | null;
    quizzesPassed: number;
    xp: number;
    level: number;
}

export function calculateEarnedBadges(stats: UserStats): Badge[] {
    return badges.filter(badge => {
        switch (badge.condition.type) {
            case 'topics':
                return stats.completedTopics >= badge.condition.value;
            case 'roadmaps':
                return stats.completedRoadmaps >= badge.condition.value;
            case 'streak':
                return stats.bestStreak >= badge.condition.value;
            case 'quizzes':
                return stats.quizzesPassed >= badge.condition.value;
            case 'xp':
                return stats.xp >= badge.condition.value;
            case 'level':
                return stats.level >= badge.condition.value;
            default:
                return false;
        }
    });
}

export function getNextBadge(stats: UserStats): Badge | null {
    const unearned = badges.filter(badge => {
        switch (badge.condition.type) {
            case 'topics':
                return stats.completedTopics < badge.condition.value;
            case 'roadmaps':
                return stats.completedRoadmaps < badge.condition.value;
            case 'streak':
                return stats.bestStreak < badge.condition.value;
            case 'quizzes':
                return stats.quizzesPassed < badge.condition.value;
            case 'xp':
                return stats.xp < badge.condition.value;
            case 'level':
                return stats.level < badge.condition.value;
            default:
                return true;
        }
    });

    if (unearned.length === 0) return null;

    // Return the badge that is closest to being earned
    return unearned.reduce((closest, badge) => {
        const getProgress = (b: Badge) => {
            switch (b.condition.type) {
                case 'topics':
                    return stats.completedTopics / b.condition.value;
                case 'roadmaps':
                    return stats.completedRoadmaps / b.condition.value;
                case 'streak':
                    return stats.currentStreak / b.condition.value;
                case 'quizzes':
                    return stats.quizzesPassed / b.condition.value;
                case 'xp':
                    return stats.xp / b.condition.value;
                case 'level':
                    return stats.level / b.condition.value;
                default:
                    return 0;
            }
        };

        return getProgress(badge) > getProgress(closest) ? badge : closest;
    });
}

export function getBadgeProgress(badge: Badge, stats: UserStats): number {
    switch (badge.condition.type) {
        case 'topics':
            return Math.min(100, (stats.completedTopics / badge.condition.value) * 100);
        case 'roadmaps':
            return Math.min(100, (stats.completedRoadmaps / badge.condition.value) * 100);
        case 'streak':
            return Math.min(100, (stats.currentStreak / badge.condition.value) * 100);
        case 'quizzes':
            return Math.min(100, (stats.quizzesPassed / badge.condition.value) * 100);
        case 'xp':
            return Math.min(100, (stats.xp / badge.condition.value) * 100);
        case 'level':
            return Math.min(100, (stats.level / badge.condition.value) * 100);
        default:
            return 0;
    }
}
