import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getComparisonIds,
  addComparisonId,
  removeComparisonId,
  clearComparison,
  isResourceInComparison,
  MAX_COMPARE_ITEMS,
} from '../features/comparison/utils/comparisonStorage';

const STORAGE_KEY = 'dwh_comparison_ids';

describe('Phase 3 — Public Knowledge Base (Frontend)', () => {
  describe('1. Comparison Storage Utilities', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('returns empty array when no comparison IDs are stored', () => {
      const ids = getComparisonIds();
      expect(ids).toEqual([]);
    });

    it('adds a resource ID to comparison and retrieves it', () => {
      const result = addComparisonId('resource-abc-123');
      expect(result.success).toBe(true);
      expect(getComparisonIds()).toContain('resource-abc-123');
    });

    it('prevents adding a duplicate ID to comparison', () => {
      addComparisonId('resource-abc-123');
      const result = addComparisonId('resource-abc-123');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Still only stored once
      expect(getComparisonIds().filter((id) => id === 'resource-abc-123').length).toBe(1);
    });

    it(`enforces maximum of ${MAX_COMPARE_ITEMS} items in comparison`, () => {
      addComparisonId('resource-001');
      addComparisonId('resource-002');
      addComparisonId('resource-003');

      const result = addComparisonId('resource-004');
      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum');
      expect(getComparisonIds().length).toBe(MAX_COMPARE_ITEMS);
    });

    it('removes a specific resource ID from comparison', () => {
      addComparisonId('resource-abc-123');
      addComparisonId('resource-def-456');

      removeComparisonId('resource-abc-123');
      const ids = getComparisonIds();
      expect(ids).not.toContain('resource-abc-123');
      expect(ids).toContain('resource-def-456');
    });

    it('correctly reports whether a resource is in comparison', () => {
      addComparisonId('resource-xyz-789');
      expect(isResourceInComparison('resource-xyz-789')).toBe(true);
      expect(isResourceInComparison('resource-not-added')).toBe(false);
    });

    it('clears all comparison IDs', () => {
      addComparisonId('resource-001');
      addComparisonId('resource-002');
      clearComparison();
      expect(getComparisonIds()).toEqual([]);
    });

    it('never exposes comparison IDs in sessionStorage (privacy boundary)', () => {
      addComparisonId('resource-001');
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('is resilient to corrupted localStorage content', () => {
      localStorage.setItem(STORAGE_KEY, 'NOT_VALID_JSON{{{{');
      const ids = getComparisonIds();
      expect(ids).toEqual([]);
    });

    it('dispatches dwh_comparison_updated event on add', () => {
      let eventFired = false;
      const handler = () => { eventFired = true; };
      window.addEventListener('dwh_comparison_updated', handler);

      addComparisonId('resource-event-test');

      window.removeEventListener('dwh_comparison_updated', handler);
      expect(eventFired).toBe(true);
    });

    it('dispatches dwh_comparison_updated event on remove', () => {
      addComparisonId('resource-event-test-2');
      let eventFired = false;
      const handler = () => { eventFired = true; };
      window.addEventListener('dwh_comparison_updated', handler);

      removeComparisonId('resource-event-test-2');

      window.removeEventListener('dwh_comparison_updated', handler);
      expect(eventFired).toBe(true);
    });

    it('dispatches dwh_comparison_updated event on clear', () => {
      addComparisonId('resource-event-test-3');
      let eventFired = false;
      const handler = () => { eventFired = true; };
      window.addEventListener('dwh_comparison_updated', handler);

      clearComparison();

      window.removeEventListener('dwh_comparison_updated', handler);
      expect(eventFired).toBe(true);
    });
  });
});
