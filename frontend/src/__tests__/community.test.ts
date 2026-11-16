import { describe, it, expect } from 'vitest';

describe('Phase 6 — Community & Feedback Client Logic', () => {
  it('validates feedback type options correctly', () => {
    const validFeedbackTypes = [
      'BUG_REPORT',
      'UI_UX_SUGGESTION',
      'CONTENT_CORRECTION',
      'ACCESSIBILITY_ISSUE',
      'GENERAL_FEEDBACK',
    ];

    expect(validFeedbackTypes).toContain('BUG_REPORT');
    expect(validFeedbackTypes).toContain('UI_UX_SUGGESTION');
    expect(validFeedbackTypes).toContain('ACCESSIBILITY_ISSUE');
    expect(validFeedbackTypes.length).toBe(5);
  });

  it('formats status badge mapping properly', () => {
    const getStatusLabel = (status: string): string => {
      switch (status) {
        case 'APPROVED':
          return 'Approved & Added';
        case 'RESOLVED':
          return 'Resolved';
        case 'REJECTED':
          return 'Declined';
        default:
          return 'Pending Review';
      }
    };

    expect(getStatusLabel('PENDING')).toBe('Pending Review');
    expect(getStatusLabel('APPROVED')).toBe('Approved & Added');
    expect(getStatusLabel('RESOLVED')).toBe('Resolved');
    expect(getStatusLabel('REJECTED')).toBe('Declined');
  });

  it('validates URL protocol requirements for student resource suggestions', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    expect(isValidUrl('https://forestapp.cc')).toBe(true);
    expect(isValidUrl('http://freedom.to')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://invalidscheme.com')).toBe(false);
  });
});
