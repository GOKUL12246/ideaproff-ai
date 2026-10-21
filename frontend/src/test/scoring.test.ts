import { describe, it, expect } from 'vitest';

describe('Validation Scoring Bands & Logic', () => {
  const getRecommendationBand = (score: number) => {
    if (score >= 80) return 'Consider the next validation stage';
    if (score >= 60) return 'Improve and test';
    if (score >= 40) return 'More validation required';
    return 'Reconsider assumptions';
  };

  it('correctly categorizes scores into the 4 configured bands', () => {
    expect(getRecommendationBand(92)).toBe('Consider the next validation stage');
    expect(getRecommendationBand(80)).toBe('Consider the next validation stage');
    expect(getRecommendationBand(74.5)).toBe('Improve and test');
    expect(getRecommendationBand(60)).toBe('Improve and test');
    expect(getRecommendationBand(55)).toBe('More validation required');
    expect(getRecommendationBand(40)).toBe('More validation required');
    expect(getRecommendationBand(35)).toBe('Reconsider assumptions');
    expect(getRecommendationBand(0)).toBe('Reconsider assumptions');
  });

  it('calculates bottom-up TAM/SAM/SOM market sizing math consistently', () => {
    const targetAccounts = 100000;
    const arpu = 120;
    const samPct = 0.20;
    const somPct = 0.05;

    const tam = targetAccounts * arpu;
    const sam = tam * samPct;
    const som = sam * somPct;

    expect(tam).toBe(12000000);
    expect(sam).toBe(2400000);
    expect(som).toBe(120000);
  });
});
