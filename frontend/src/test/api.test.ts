import { describe, it, expect, beforeEach } from 'vitest';
import { api, ApiError } from '../lib/api';

describe('Frontend API Client & Error Handling', () => {
  beforeEach(() => {
    // Provide in-memory storage mock if running in Node environment
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        length: 0,
        key: () => null,
      };
    } else {
      globalThis.localStorage.clear();
    }
  });

  it('ApiError should format error message and status correctly', () => {
    const error = new ApiError('Not found', 404, { detail: 'Missing resource' });
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.data.detail).toBe('Missing resource');
  });

  it('Surveys export CSV URL is formed properly', () => {
    const url = api.surveys.getExportCsvUrl('test_123');
    expect(url).toContain('/surveys/test_123/export-csv');
  });

  it('Reports PDF download URL is formed properly', () => {
    const url = api.reports.downloadPdfUrl('report_456');
    expect(url).toContain('/reports/report_456/download');
  });
});
