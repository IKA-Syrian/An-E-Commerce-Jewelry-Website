import { useState, useEffect } from 'react';
import goldPriceService, { GoldPriceCalculated, HistoricalDataPoint } from '@/services/goldPriceService';

export function useCurrentGoldPrices() {
  const [currentPrices, setCurrentPrices] = useState<GoldPriceCalculated | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const data = await goldPriceService.getLatestFromExternalApi();
        setCurrentPrices(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch gold prices'));
        console.error('Error fetching gold prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { currentPrices, loading, error };
}

export function useHistoricalGoldPrices(days: number = 180) {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const data = await goldPriceService.getHistoricalData(days);
        setHistoricalData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch historical gold prices'));
        console.error('Error fetching historical gold prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [days]);

  return { historicalData, loading, error };
}

export function useWeeklyGoldPrices() {
  const [weeklyData, setWeeklyData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const data = await goldPriceService.getWeeklyData();
        setWeeklyData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch weekly gold prices'));
        console.error('Error fetching weekly gold prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  return { weeklyData, loading, error };
} 