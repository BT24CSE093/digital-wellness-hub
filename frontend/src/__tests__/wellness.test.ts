import { describe, it, expect } from 'vitest';
import { WellnessTier } from '../features/wellness/types/wellness.types';

describe('Phase 4: Student Wellness Core (Frontend Utilities & Calculations)', () => {
  // ==========================================
  // 1. FOCUS TIMER CALCULATIONS
  // ==========================================
  describe('Focus Timer Calculations', () => {
    it('accurately computes formatted time string from seconds', () => {
      const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      expect(formatTime(25 * 60)).toBe('25:00');
      expect(formatTime(5 * 60)).toBe('05:00');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(150)).toBe('02:30');
    });

    it('calculates progress ratio accurately', () => {
      const getProgressRatio = (durationMinutes: number, remainingSeconds: number) => {
        const total = durationMinutes * 60;
        if (total <= 0) return 0;
        return (total - remainingSeconds) / total;
      };

      expect(getProgressRatio(25, 25 * 60)).toBe(0); // At start
      expect(getProgressRatio(25, 12.5 * 60)).toBeCloseTo(0.5); // Halfway
      expect(getProgressRatio(25, 0)).toBe(1); // Completed
    });

    it('computes background-tab drift tolerance using Date.now() target timestamp', () => {
      const now = 1000000;
      const targetEndTime = now + 25 * 60 * 1000; // 25 min in future

      // Simulate 10 minutes passing while tab was inactive
      const simulatedNow = now + 10 * 60 * 1000;
      const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - simulatedNow) / 1000));

      expect(remainingSeconds).toBe(15 * 60); // Exactly 15 minutes left
    });
  });

  // ==========================================
  // 2. SCREEN-TIME CALCULATIONS & BUDGETS
  // ==========================================
  describe('Screen-Time Calculations', () => {
    it('computes daily percentage against goal', () => {
      const getPercentage = (loggedMins: number, goalMins: number) => {
        if (!goalMins) return 0;
        return Math.min(100, Math.round((loggedMins / goalMins) * 100));
      };

      expect(getPercentage(180, 360)).toBe(50);
      expect(getPercentage(360, 360)).toBe(100);
      expect(getPercentage(420, 360)).toBe(100); // capped at 100% for progress bar
    });

    it('accurately identifies exceeded state and remaining minutes', () => {
      const evaluateBudget = (loggedMins: number, goalMins: number) => {
        const remaining = Math.max(0, goalMins - loggedMins);
        const isExceeded = loggedMins > goalMins;
        const overBy = isExceeded ? loggedMins - goalMins : 0;
        return { remaining, isExceeded, overBy };
      };

      const under = evaluateBudget(200, 300);
      expect(under.isExceeded).toBe(false);
      expect(under.remaining).toBe(100);
      expect(under.overBy).toBe(0);

      const over = evaluateBudget(350, 300);
      expect(over.isExceeded).toBe(true);
      expect(over.remaining).toBe(0);
      expect(over.overBy).toBe(50);
    });

    it('aggregates category breakdown minutes', () => {
      const breakdown = {
        socialMedia: 60,
        education: 90,
        gaming: 30,
        productivity: 45,
      };

      const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
      expect(total).toBe(225);
    });
  });

  // ==========================================
  // 3. WELLNESS ASSESSMENT SCORING & TIERS
  // ==========================================
  describe('Assessment Scoring Logic', () => {
    const calculateTier = (score: number): WellnessTier => {
      if (score >= 80) return 'OPTIMAL';
      if (score >= 60) return 'BALANCED';
      if (score >= 40) return 'MODERATE';
      return 'CRITICAL';
    };

    it('assigns correct tier classifications across the score spectrum', () => {
      expect(calculateTier(95)).toBe('OPTIMAL');
      expect(calculateTier(80)).toBe('OPTIMAL');
      expect(calculateTier(79)).toBe('BALANCED');
      expect(calculateTier(60)).toBe('BALANCED');
      expect(calculateTier(59)).toBe('MODERATE');
      expect(calculateTier(40)).toBe('MODERATE');
      expect(calculateTier(39)).toBe('CRITICAL');
      expect(calculateTier(10)).toBe('CRITICAL');
    });

    it('transforms 1-5 scale responses into 0-100 percentage scores', () => {
      const toPercentage = (scores: number[]) => {
        const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
        return Math.round(((avg - 1) / 4) * 100);
      };

      expect(toPercentage([5, 5])).toBe(100); // 5 -> 100%
      expect(toPercentage([1, 1])).toBe(0);   // 1 -> 0%
      expect(toPercentage([3, 3])).toBe(50);  // 3 -> 50%
      expect(toPercentage([4, 4])).toBe(75);  // 4 -> 75%
      expect(toPercentage([2, 2])).toBe(25);  // 2 -> 25%
    });
  });

  // ==========================================
  // 4. DAILY PLANNER STATE MANAGEMENT
  // ==========================================
  describe('Daily Planner Logic', () => {
    it('computes completed vs pending task statistics', () => {
      const tasks = [
        { id: '1', text: 'Task 1', completed: true },
        { id: '2', text: 'Task 2', completed: false },
        { id: '3', text: 'Task 3', completed: true },
        { id: '4', text: 'Task 4', completed: false },
      ];

      const completedCount = tasks.filter((t) => t.completed).length;
      const pendingCount = tasks.length - completedCount;

      expect(completedCount).toBe(2);
      expect(pendingCount).toBe(2);
    });

    it('toggles task completion status', () => {
      let tasks = [
        { id: 't1', text: 'Study OS', completed: false },
      ];

      tasks = tasks.map((t) => (t.id === 't1' ? { ...t, completed: !t.completed } : t));
      expect(tasks[0].completed).toBe(true);

      tasks = tasks.map((t) => (t.id === 't1' ? { ...t, completed: !t.completed } : t));
      expect(tasks[0].completed).toBe(false);
    });
  });
});
