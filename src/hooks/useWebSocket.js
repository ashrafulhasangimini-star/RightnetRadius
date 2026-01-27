import { useEffect, useRef, useCallback } from 'react';

// Hook for polling real-time data with fallback to HTTP
export function useRealtimeData(url, interval = 5000) {
  const dataRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        dataRef.current = data;
        return data;
      }
    } catch (error) {
      console.error('Realtime data fetch error:', error);
    }
    return null;
  }, [url]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);

  return dataRef;
}

// Simulated WebSocket for fallback (when real WebSocket unavailable)
export function usePollingFallback(url, interval = 5000, onUpdate) {
  const dataRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const newData = await response.json();
          
          // Detect changes and notify
          if (JSON.stringify(dataRef.current) !== JSON.stringify(newData)) {
            dataRef.current = newData;
            onUpdate?.(newData);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling interval
    const pollInterval = setInterval(fetchData, interval);

    return () => clearInterval(pollInterval);
  }, [url, interval, onUpdate]);

  return dataRef;
}


