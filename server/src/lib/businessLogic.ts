/**
 * Pure business logic functions extracted for testability.
 * These mirror the logic in routes/profile.ts and routes/quiz.ts.
 */

// ── Streak Calculation ─────────────────────────────────────

export interface StreakInput {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date | null;
}

export interface StreakResult {
    newStreak: number;
    newLongestStreak: number;
}

export function calculateStreak(input: StreakInput, today: Date): StreakResult {
    const todayNorm = new Date(today);
    todayNorm.setHours(0, 0, 0, 0);

    let newStreak = input.currentStreak;
    let newLongestStreak = input.longestStreak;

    if (input.lastActiveDate) {
        const lastActive = new Date(input.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
            (todayNorm.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
            // Same day, no change
        } else if (diffDays === 1) {
            // Consecutive day
            newStreak = input.currentStreak + 1;
        } else {
            // Streak broken
            newStreak = 1;
        }
    } else {
        // First activity
        newStreak = 1;
    }

    if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
    }

    return { newStreak, newLongestStreak };
}

// ── XP / Level Calculation ─────────────────────────────────

export function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

export function calculateNewXp(currentXp: number, amount: number): { xp: number; level: number } {
    const xp = currentXp + amount;
    return { xp, level: calculateLevel(xp) };
}

// ── Quiz Scoring ───────────────────────────────────────────

export interface QuizScoreInput {
    score: number;
    totalQuestions: number;
}

export function calculateQuizResult(input: QuizScoreInput): {
    percentage: number;
    passed: boolean;
} {
    const percentage = Math.round((input.score / input.totalQuestions) * 100);
    return {
        percentage,
        passed: percentage >= 90,
    };
}
