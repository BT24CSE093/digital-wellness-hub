import { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
  service: string;
  environment: string;
  version: string;
}

export function useHealthCheck() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        setLoading(true);
        const res = await apiRequest<{ success: boolean; data: HealthResponse }>('/health');
        if (isMounted) {
          setData(res.data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to connect to backend API');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
