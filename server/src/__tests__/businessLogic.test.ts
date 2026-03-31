import { describe, it, expect } from "vitest";
import {
    calculateStreak,
    calculateLevel,
    calculateNewXp,
    calculateQuizResult,
} from "../lib/businessLogic.js";

// ── Streak Tests ───────────────────────────────────────────

describe("calculateStreak", () => {
    const today = new Date("2026-03-31T12:00:00Z");

    it("should start at 1 for first activity (no lastActiveDate)", () => {
        const result = calculateStreak(
            { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
            today
        );
        expect(result.newStreak).toBe(1);
        expect(result.newLongestStreak).toBe(1);
    });

    it("should not change streak for same day activity", () => {
        const result = calculateStreak(
            {
                currentStreak: 5,
                longestStreak: 10,
                lastActiveDate: new Date("2026-03-31T08:00:00Z"), // same day
            },
            today
        );
        expect(result.newStreak).toBe(5);
        expect(result.newLongestStreak).toBe(10);
    });

    it("should increment streak for consecutive day", () => {
        const result = calculateStreak(
            {
                currentStreak: 3,
                longestStreak: 5,
                lastActiveDate: new Date("2026-03-30T12:00:00Z"), // yesterday same time
            },
            today
        );
        expect(result.newStreak).toBe(4);
        expect(result.newLongestStreak).toBe(5);
    });

    it("should reset streak to 1 when gap > 1 day", () => {
        const result = calculateStreak(
            {
                currentStreak: 7,
                longestStreak: 10,
                lastActiveDate: new Date("2026-03-28T12:00:00Z"), // 3 days ago
            },
            today
        );
        expect(result.newStreak).toBe(1);
        expect(result.newLongestStreak).toBe(10);
    });

    it("should update longestStreak when current exceeds it", () => {
        const result = calculateStreak(
            {
                currentStreak: 9,
                longestStreak: 9,
                lastActiveDate: new Date("2026-03-30T12:00:00Z"), // yesterday
            },
            today
        );
        expect(result.newStreak).toBe(10);
        expect(result.newLongestStreak).toBe(10);
    });

    it("should not decrease longestStreak when streak resets", () => {
        const result = calculateStreak(
            {
                currentStreak: 5,
                longestStreak: 20,
                lastActiveDate: new Date("2026-03-01T12:00:00Z"), // long gap
            },
            today
        );
        expect(result.newStreak).toBe(1);
        expect(result.newLongestStreak).toBe(20);
    });
});

// ── XP / Level Tests ───────────────────────────────────────

describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
        expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 1 for 499 XP", () => {
        expect(calculateLevel(499)).toBe(1);
    });

    it("should return level 2 for 500 XP", () => {
        expect(calculateLevel(500)).toBe(2);
    });

    it("should return level 3 for 1000 XP", () => {
        expect(calculateLevel(1000)).toBe(3);
    });

    it("should return level 11 for 5000 XP", () => {
        expect(calculateLevel(5000)).toBe(11);
    });
});

describe("calculateNewXp", () => {
    it("should add XP and calculate correct level", () => {
        const result = calculateNewXp(400, 100);
        expect(result.xp).toBe(500);
        expect(result.level).toBe(2);
    });

    it("should handle level up from 0", () => {
        const result = calculateNewXp(0, 500);
        expect(result.xp).toBe(500);
        expect(result.level).toBe(2);
    });

    it("should stay at same level for small XP gain", () => {
        const result = calculateNewXp(100, 50);
        expect(result.xp).toBe(150);
        expect(result.level).toBe(1);
    });
});

// ── Quiz Scoring Tests ─────────────────────────────────────

describe("calculateQuizResult", () => {
    it("should pass with perfect score (5/5 = 100%)", () => {
        const result = calculateQuizResult({ score: 5, totalQuestions: 5 });
        expect(result.percentage).toBe(100);
        expect(result.passed).toBe(true);
    });

    it("should pass with 90% (9/10)", () => {
        const result = calculateQuizResult({ score: 9, totalQuestions: 10 });
        expect(result.percentage).toBe(90);
        expect(result.passed).toBe(true);
    });

    it("should fail with 80% (4/5)", () => {
        const result = calculateQuizResult({ score: 4, totalQuestions: 5 });
        expect(result.percentage).toBe(80);
        expect(result.passed).toBe(false);
    });

    it("should fail with 0% (0/5)", () => {
        const result = calculateQuizResult({ score: 0, totalQuestions: 5 });
        expect(result.percentage).toBe(0);
        expect(result.passed).toBe(false);
    });

    it("should handle edge case 89% → fail", () => {
        const result = calculateQuizResult({ score: 89, totalQuestions: 100 });
        expect(result.percentage).toBe(89);
        expect(result.passed).toBe(false);
    });
});
