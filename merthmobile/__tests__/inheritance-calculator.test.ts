/**
 * Unit Tests for Inheritance Calculator
 * Tests core calculation logic for all madhabs
 * 
 * @author Manus AI
 * @version 1.0.0
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { InheritanceCalculator } from '../lib/inheritance-calculator';

describe('InheritanceCalculator', () => {
  let calculator: InheritanceCalculator;

  describe('Basic Calculations - Shafi School', () => {
    it('should calculate simple case: husband and wife', () => {
      const estate = { total: 1000, funeral: 0, debts: 0, will: 0 };
      const heirs = { husband: 1, wife: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(1000);
      expect(result.shares).toBeDefined();
      expect(result.shares.length).toBeGreaterThan(0);
    });

    it('should calculate case with parents and children', () => {
      const estate = { total: 2000, funeral: 0, debts: 0, will: 0 };
      const heirs = { father: 1, mother: 1, son: 2, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(2000);
      expect(result.shares).toBeDefined();
    });

    it('should handle only daughters case', () => {
      const estate = { total: 1500, funeral: 0, debts: 0, will: 0 };
      const heirs = { daughter: 2 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(1500);
    });
  });

  describe('Basic Calculations - Hanafi School', () => {
    it('should calculate case with parents and children', () => {
      const estate = { total: 2000, funeral: 0, debts: 0, will: 0 };
      const heirs = { father: 1, mother: 1, son: 2, daughter: 1 };
      
      calculator = new InheritanceCalculator('hanafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(2000);
      expect(result.shares).toBeDefined();
    });

    it('should handle widow with children', () => {
      const estate = { total: 1200, funeral: 0, debts: 0, will: 0 };
      const heirs = { wife: 1, son: 1, daughter: 1 };
      
      calculator = new InheritanceCalculator('hanafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(1200);
    });
  });

  describe('Estate Data Validation', () => {
    it('should handle estate with debts', () => {
      const estate = { total: 1000, funeral: 0, debts: 200, will: 0 };
      const heirs = { son: 1, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBeLessThanOrEqual(800);
    });

    it('should handle estate with will', () => {
      const estate = { total: 1000, funeral: 0, debts: 0, will: 100 };
      const heirs = { son: 1, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBeLessThanOrEqual(900);
    });

    it('should handle funeral expenses', () => {
      const estate = { total: 1000, funeral: 50, debts: 0, will: 0 };
      const heirs = { son: 1, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBeLessThanOrEqual(950);
    });

    it('should handle zero heirs gracefully', () => {
      const estate = { total: 1000, funeral: 0, debts: 0, will: 0 };
      const heirs = {};
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
    });
  });

  describe('Multiple Madhabs Comparison', () => {
    it('should produce results for different madhabs', () => {
      const estate = { total: 3000, funeral: 0, debts: 0, will: 0 };
      const heirs = { father: 1, mother: 1, son: 1, daughter: 1 };
      
      const shafiCalc = new InheritanceCalculator('shafi', estate, heirs);
      const hanafiCalc = new InheritanceCalculator('hanafi', estate, heirs);
      const malikilCalc = new InheritanceCalculator('maliki', estate, heirs);
      const hanbalCalc = new InheritanceCalculator('hanbali', estate, heirs);
      
      const shafiResult = shafiCalc.calculate();
      const hanafiResult = hanafiCalc.calculate();
      const malikilResult = malikilCalc.calculate();
      const hanbalResult = hanbalCalc.calculate();
      
      expect(shafiResult).toBeDefined();
      expect(hanafiResult).toBeDefined();
      expect(malikilResult).toBeDefined();
      expect(hanbalResult).toBeDefined();
      
      // All should have shares
      expect(shafiResult.shares.length).toBeGreaterThan(0);
      expect(hanafiResult.shares.length).toBeGreaterThan(0);
      expect(malikilResult.shares.length).toBeGreaterThan(0);
      expect(hanbalResult.shares.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single heir', () => {
      const estate = { total: 500, funeral: 0, debts: 0, will: 0 };
      const heirs = { son: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(500);
    });

    it('should handle large estate amounts', () => {
      const estate = { total: 1000000, funeral: 0, debts: 0, will: 0 };
      const heirs = { son: 2, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(1000000);
    });

    it('should handle multiple children', () => {
      const estate = { total: 2000, funeral: 0, debts: 0, will: 0 };
      const heirs = { son: 3, daughter: 2 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(2000);
    });

    it('should handle complex case with all deductions', () => {
      const estate = { total: 5000, funeral: 100, debts: 500, will: 300 };
      const heirs = { father: 1, mother: 1, son: 2, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result).toBeDefined();
      expect(result.netEstate).toBe(4100); // 5000 - 100 - 500 - 300
    });
  });

  describe('Calculation Confidence', () => {
    it('should provide confidence levels', () => {
      const estate = { total: 1000, funeral: 0, debts: 0, will: 0 };
      const heirs = { son: 1, daughter: 1 };
      
      calculator = new InheritanceCalculator('shafi', estate, heirs);
      const result = calculator.calculate();
      
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.confidenceLevel).toBeDefined();
    });
  });
});
