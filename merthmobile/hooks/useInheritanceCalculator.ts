import { useState, useCallback } from 'react';
import { InheritanceCalculator, EstateData, HeirsData, CalculationResult, FIQH_DATABASE } from '@/lib/inheritance-calculator';

export interface CalculatorState {
  madhab: string;
  estate: EstateData;
  heirs: HeirsData;
  result: CalculationResult | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_ESTATE: EstateData = {
  total: 100000,
  funeral: 0,
  debts: 0,
  will: 0,
};

const DEFAULT_HEIRS: HeirsData = {
  husband: 0,
  wife: 0,
  father: 0,
  mother: 0,
  grandfather: 0,
  grandmother: 0,
  son: 0,
  daughter: 0,
  grandson: 0,
  granddaughter: 0,
  full_brother: 0,
  full_sister: 0,
  paternal_brother: 0,
  paternal_sister: 0,
  maternal_brother: 0,
  maternal_sister: 0,
};

export function useInheritanceCalculator() {
  const [state, setState] = useState<CalculatorState>({
    madhab: 'shafii',
    estate: DEFAULT_ESTATE,
    heirs: DEFAULT_HEIRS,
    result: null,
    loading: false,
    error: null,
  });

  const setMadhab = useCallback((madhab: string) => {
    setState(prev => ({ ...prev, madhab, error: null }));
  }, []);

  const setEstateField = useCallback((field: keyof EstateData, value: number) => {
    setState(prev => ({
      ...prev,
      estate: { ...prev.estate, [field]: Math.max(0, value) },
      error: null,
    }));
  }, []);

  const setHeirCount = useCallback((heir: keyof HeirsData, count: number) => {
    setState(prev => ({
      ...prev,
      heirs: { ...prev.heirs, [heir]: Math.max(0, count) },
      error: null,
    }));
  }, []);

  const calculate = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Validate that at least one heir is present
      const hasHeirs = Object.values(state.heirs).some(count => count > 0);
      if (!hasHeirs) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'يجب تحديد وارث واحد على الأقل',
          result: null,
        }));
        return;
      }

      // Validate estate
      if (state.estate.total <= 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'يجب أن تكون التركة أكبر من صفر',
          result: null,
        }));
        return;
      }

      // Calculate
      const calculator = new InheritanceCalculator(state.madhab, state.estate, state.heirs);
      const result = calculator.calculate();

      setState(prev => ({
        ...prev,
        loading: false,
        result,
        error: result.error ? result.error : null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'حدث خطأ في الحساب',
        result: null,
      }));
    }
  }, [state.madhab, state.estate, state.heirs]);

  const reset = useCallback(() => {
    setState({
      madhab: 'shafii',
      estate: DEFAULT_ESTATE,
      heirs: DEFAULT_HEIRS,
      result: null,
      loading: false,
      error: null,
    });
  }, []);

  const getMadhhabInfo = useCallback(() => {
    return FIQH_DATABASE.madhabs[state.madhab as keyof typeof FIQH_DATABASE.madhabs];
  }, [state.madhab]);

  const getHeirName = useCallback((key: string) => {
    return FIQH_DATABASE.heirNames[key as keyof typeof FIQH_DATABASE.heirNames] || key;
  }, []);

  return {
    state,
    setMadhab,
    setEstateField,
    setHeirCount,
    calculate,
    reset,
    getMadhhabInfo,
    getHeirName,
  };
}
