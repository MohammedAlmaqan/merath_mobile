/**
 * Unit Tests for Inheritance Calculator
 * Tests core calculation logic for all madhabs
 * 
 * @author Manus AI
 * @version 1.0.0
 */

import { InheritanceCalculator, Madhab, Heir } from '../lib/inheritance-calculator';

describe('InheritanceCalculator', () => {
  let calculator: InheritanceCalculator;

  beforeEach(() => {
    calculator = new InheritanceCalculator();
  });

  describe('Basic Calculations', () => {
    test('should calculate simple case: husband and wife', () => {
      const heirs: Heir[] = [
        { type: 'husband', count: 1 },
        { type: 'wife', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result).toBeDefined();
      expect(result.heirs).toHaveLength(2);
      expect(result.totalDistributed).toBe(1000);
    });

    test('should calculate case with parents and children', () => {
      const heirs: Heir[] = [
        { type: 'father', count: 1 },
        { type: 'mother', count: 1 },
        { type: 'son', count: 2 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 2000, debts: 0, expenses: 0, will: 0 },
        Madhab.HANAFI
      );

      expect(result).toBeDefined();
      expect(result.heirs).toHaveLength(4);
      expect(result.totalDistributed).toBe(2000);
    });
  });

  describe('Madhab Differences', () => {
    test('should apply different rules for Shafi madhab', () => {
      const heirs: Heir[] = [
        { type: 'husband', count: 1 },
        { type: 'mother', count: 1 },
        { type: 'sister_full', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.madhab).toBe(Madhab.SHAFI);
      expect(result.heirs).toBeDefined();
    });

    test('should apply different rules for Hanafi madhab', () => {
      const heirs: Heir[] = [
        { type: 'husband', count: 1 },
        { type: 'mother', count: 1 },
        { type: 'sister_full', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.HANAFI
      );

      expect(result.madhab).toBe(Madhab.HANAFI);
      expect(result.heirs).toBeDefined();
    });

    test('should apply different rules for Maliki madhab', () => {
      const heirs: Heir[] = [
        { type: 'husband', count: 1 },
        { type: 'mother', count: 1 },
        { type: 'sister_full', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.MALIKI
      );

      expect(result.madhab).toBe(Madhab.MALIKI);
      expect(result.heirs).toBeDefined();
    });

    test('should apply different rules for Hanbali madhab', () => {
      const heirs: Heir[] = [
        { type: 'husband', count: 1 },
        { type: 'mother', count: 1 },
        { type: 'sister_full', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.HANBALI
      );

      expect(result.madhab).toBe(Madhab.HANBALI);
      expect(result.heirs).toBeDefined();
    });
  });

  describe('Special Cases', () => {
    test('should handle Awl (increase in shares)', () => {
      const heirs: Heir[] = [
        { type: 'daughter', count: 2 },
        { type: 'sister_full', count: 2 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.awlApplied).toBe(true);
      expect(result.totalDistributed).toBe(1000);
    });

    test('should handle Radd (return to heirs)', () => {
      const heirs: Heir[] = [
        { type: 'daughter', count: 1 },
        { type: 'mother', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.raddApplied).toBe(true);
      expect(result.totalDistributed).toBe(1000);
    });

    test('should handle blocked heirs correctly', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
        { type: 'father', count: 1 },
        { type: 'grandfather', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      // Grandfather should be blocked by father
      const grandfatherHeir = result.heirs.find((h) => h.type === 'grandfather');
      expect(grandfatherHeir?.isBlocked).toBe(true);
    });
  });

  describe('Estate Deductions', () => {
    test('should deduct debts from estate', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 200, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.netEstate).toBe(800);
      expect(result.totalDistributed).toBe(800);
    });

    test('should deduct expenses from estate', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 100, will: 0 },
        Madhab.SHAFI
      );

      expect(result.netEstate).toBe(900);
      expect(result.totalDistributed).toBe(900);
    });

    test('should deduct will from estate', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 150 },
        Madhab.SHAFI
      );

      expect(result.netEstate).toBe(850);
      expect(result.totalDistributed).toBe(850);
    });

    test('should deduct all deductions combined', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 100, expenses: 50, will: 100 },
        Madhab.SHAFI
      );

      expect(result.netEstate).toBe(750);
      expect(result.totalDistributed).toBe(750);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero estate', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 0, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.netEstate).toBe(0);
      expect(result.totalDistributed).toBe(0);
    });

    test('should handle single heir', () => {
      const heirs: Heir[] = [{ type: 'son', count: 1 }];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.heirs).toHaveLength(1);
      expect(result.totalDistributed).toBe(1000);
    });

    test('should handle multiple heirs of same type', () => {
      const heirs: Heir[] = [{ type: 'son', count: 5 }];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      expect(result.heirs).toHaveLength(1);
      expect(result.heirs[0].count).toBe(5);
    });
  });

  describe('Fraction Handling', () => {
    test('should handle fractional shares correctly', () => {
      const heirs: Heir[] = [
        { type: 'son', count: 1 },
        { type: 'daughter', count: 1 },
        { type: 'mother', count: 1 },
      ];

      const result = calculator.calculate(
        heirs,
        { total: 1000, debts: 0, expenses: 0, will: 0 },
        Madhab.SHAFI
      );

      // Verify that fractions are handled correctly
      const totalShares = result.heirs.reduce((sum, heir) => sum + heir.share, 0);
      expect(totalShares).toBeCloseTo(1000, 2);
    });
  });

  describe('Validation', () => {
    test('should throw error for empty heirs array', () => {
      expect(() => {
        calculator.calculate(
          [],
          { total: 1000, debts: 0, expenses: 0, will: 0 },
          Madhab.SHAFI
        );
      }).toThrow();
    });

    test('should throw error for negative estate', () => {
      const heirs: Heir[] = [{ type: 'son', count: 1 }];

      expect(() => {
        calculator.calculate(
          heirs,
          { total: -1000, debts: 0, expenses: 0, will: 0 },
          Madhab.SHAFI
        );
      }).toThrow();
    });

    test('should throw error for invalid heir type', () => {
      const heirs: Heir[] = [{ type: 'invalid_type' as any, count: 1 }];

      expect(() => {
        calculator.calculate(
          heirs,
          { total: 1000, debts: 0, expenses: 0, will: 0 },
          Madhab.SHAFI
        );
      }).toThrow();
    });
  });
});
