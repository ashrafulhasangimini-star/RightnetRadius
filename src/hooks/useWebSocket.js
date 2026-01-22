import { useEffect, useRef, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// WebSocket configuration for real-time updates
export function useWebSocketBroadcast() {
  const echoRef = useRef(null);

  useEffect(() => {
    // Initialize Laravel Echo with Pusher
    window.Pusher = Pusher;

    echoRef.current = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY || 'local',
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
      encrypted: true,
      host: 'localhost',
      port: 6001,
      disableStats: true,
    });

    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
      }
    };
  }, []);

  return echoRef.current;
}

// Subscribe to session updates
export function useSessionUpdates(callback) {
  const echo = useWebSocketBroadcast();

  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('sessions');
    
    channel.listen('.session.connected', (data) => {
      console.log('Session connected:', data);
      callback?.({ type: 'connected', data });
    });

    channel.listen('.session.updated', (data) => {
      console.log('Session updated:', data);
      callback?.({ type: 'updated', data });
    });

    channel.listen('.session.disconnected', (data) => {
      console.log('Session disconnected:', data);
      callback?.({ type: 'disconnected', data });
    });

    return () => {
      channel.stopListening('.session.connected');
      channel.stopListening('.session.updated');
      channel.stopListening('.session.disconnected');
    };
  }, [echo, callback]);
}

// Subscribe to bandwidth updates
export function useBandwidthUpdates(callback) {
  const echo = useWebSocketBroadcast();

  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('bandwidth');
    
    channel.listen('.bandwidth.updated', (data) => {
      console.log('Bandwidth updated:', data);
      callback?.(data);
    });

    return () => {
      channel.stopListening('.bandwidth.updated');
    };
  }, [echo, callback]);
}

// Subscribe to quota warnings
export function useQuotaWarnings(callback) {
  const echo = useWebSocketBroadcast();

  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('notifications');
    
    channel.listen('.quota.warning', (data) => {
      console.log('Quota warning:', data);
      callback?.(data);
    });

    return () => {
      channel.stopListening('.quota.warning');
    };
  }, [echo, callback]);
}

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

export default useWebSocketBroadcast;
