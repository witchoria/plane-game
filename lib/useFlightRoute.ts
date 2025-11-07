import { useState, useEffect } from 'react';
import { FlightRoute } from '@/types';

export function useFlightRoute(callsign: string | null, icao24: string) {
  const [route, setRoute] = useState<FlightRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callsign || !icao24) {
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          callsign: callsign.trim(),
          icao24
        });

        const response = await fetch(`/api/flight-route?${params}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        }

        setRoute(data);
      } catch (err) {
        console.error('Failed to fetch flight route:', err);
        setError('Failed to fetch flight route');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [callsign, icao24]);

  return { route, loading, error };
}
