import { describe, it, expect } from 'vitest';

describe('Phase 5 — Challenges & Gamification Logic', () => {
  it('calculates challenge completion percentage correctly', () => {
    const calculateProgress = (completedDays: number[], durationDays: number): number => {
      if (durationDays <= 0) return 0;
      return Math.min(100, Math.round((completedDays.length / durationDays) * 100));
    };

    expect(calculateProgress([], 7)).toBe(0);
    expect(calculateProgress([1], 7)).toBe(14);
    expect(calculateProgress([1, 2, 3], 7)).toBe(43);
    expect(calculateProgress([1, 2, 3, 4, 5, 6, 7], 7)).toBe(100);
  });

  it('determines if a challenge is fully completed', () => {
    const isCompleted = (completedDays: number[], durationDays: number): boolean => {
      return durationDays > 0 && completedDays.length >= durationDays;
    };

    expect(isCompleted([1, 2, 3], 7)).toBe(false);
    expect(isCompleted([1, 2, 3, 4, 5, 6, 7], 7)).toBe(true);
  });

  it('calculates achievement progress percentage safely without division by zero', () => {
    const getAchievementPercent = (current: number, target: number): number => {
      if (target <= 0) return 100;
      return Math.min(100, Math.round((current / target) * 100));
    };

    expect(getAchievementPercent(0, 10)).toBe(0);
    expect(getAchievementPercent(5, 10)).toBe(50);
    expect(getAchievementPercent(15, 10)).toBe(100);
    expect(getAchievementPercent(2, 0)).toBe(100);
  });

  it('validates streak non-punitive calculation', () => {
    // Non-shaming: streaks celebrate consecutive completed days rather than punishing breaks
    const computeStreak = (completedDays: number[]): number => {
      if (completedDays.length === 0) return 0;
      const sorted = [...new Set(completedDays)].sort((a, b) => a - b);
      let maxConsecutive = 1;
      let currentRun = 1;

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
          currentRun++;
          if (currentRun > maxConsecutive) maxConsecutive = currentRun;
        } else {
          currentRun = 1;
        }
      }
      return maxConsecutive;
    };

    expect(computeStreak([])).toBe(0);
    expect(computeStreak([1, 2, 3])).toBe(3);
    expect(computeStreak([1, 3, 4, 5])).toBe(3);
    expect(computeStreak([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
});
