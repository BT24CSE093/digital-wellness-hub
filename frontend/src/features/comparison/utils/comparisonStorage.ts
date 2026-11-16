const COMPARISON_STORAGE_KEY = 'dwh_comparison_ids';
export const MAX_COMPARE_ITEMS = 3;

export function getComparisonIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isResourceInComparison(id: string): boolean {
  const ids = getComparisonIds();
  return ids.includes(id);
}

export function addComparisonId(id: string): { success: boolean; error?: string } {
  const current = getComparisonIds();
  if (current.includes(id)) {
    return { success: false, error: 'Resource is already in comparison.' };
  }
  if (current.length >= MAX_COMPARE_ITEMS) {
    return {
      success: false,
      error: `You can compare a maximum of ${MAX_COMPARE_ITEMS} resources simultaneously.`,
    };
  }

  const updated = [...current, id];
  localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('dwh_comparison_updated'));
  return { success: true };
}

export function removeComparisonId(id: string): void {
  const current = getComparisonIds();
  const updated = current.filter((item) => item !== id);
  localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('dwh_comparison_updated'));
}

export function clearComparison(): void {
  localStorage.removeItem(COMPARISON_STORAGE_KEY);
  window.dispatchEvent(new Event('dwh_comparison_updated'));
}
