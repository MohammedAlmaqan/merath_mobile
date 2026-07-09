import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationResult, EstateData, HeirsData } from '@/lib/inheritance-calculator';

export interface CalculationRecord {
  id: string;
  timestamp: number;
  date: string;
  madhab: string;
  madhhabName: string;
  estate: EstateData;
  heirs: HeirsData;
  result: CalculationResult;
}

const STORAGE_KEY = 'merath_calculation_history';
const MAX_RECORDS = 50;

export function useCalculationHistory() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from AsyncStorage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const records = JSON.parse(data) as CalculationRecord[];
        setHistory(records.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecord = useCallback(
    async (
      madhab: string,
      madhhabName: string,
      estate: EstateData,
      heirs: HeirsData,
      result: CalculationResult
    ) => {
      try {
        const newRecord: CalculationRecord = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          date: new Date().toLocaleString('ar-SA'),
          madhab,
          madhhabName,
          estate,
          heirs,
          result,
        };

        const updatedHistory = [newRecord, ...history].slice(0, MAX_RECORDS);
        setHistory(updatedHistory);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        return newRecord;
      } catch (error) {
        return null;
      }
    },
    [history]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        const updatedHistory = history.filter((record) => record.id !== id);
        setHistory(updatedHistory);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
      }
    },
    [history]
  );

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
    }
  }, []);

  const getRecordById = useCallback(
    (id: string) => {
      return history.find((record) => record.id === id);
    },
    [history]
  );

  return {
    history,
    loading,
    addRecord,
    deleteRecord,
    clearHistory,
    getRecordById,
    reload: loadHistory,
  };
}
