import { describe, it, expect } from 'vitest';
import { generateCSV, generateReportHTML } from '../lib/report';

const dummyResult = {
  netEstate: 100000,
  finalBase: 'BaseExample',
  confidence: 0.95,
  shares: [
    { name: 'زوج', count: 1, fraction: { toString: () => '1/2' }, amount: 50000 },
    { name: 'ابنة', count: 2, fraction: { toString: () => '3/4' }, amount: 25000 },
  ],
};

describe('report utilities', () => {
  it('generates CSV with correct lines', () => {
    const csv = generateCSV(dummyResult as any);
    expect(csv.split('\n').length).toBe(3);
    expect(csv).toContain('زوج');
    expect(csv).toContain('ابنة');
  });

  it('generates HTML containing summary values', () => {
    const html = generateReportHTML(dummyResult as any, 'shafii');
    expect(html).toContain('نتيجة حساب المواريث');
    expect(html).toContain('100000');
    expect(html).toContain('BaseExample');
  });
});
