import { useState, useEffect } from 'react';
import { Aircraft, OpenSkyResponse } from '@/types';
import { calculateBoundingBox, parseOpenSkyState } from './opensky';
import { isCommercialFlight } from './airlines';

export function useAircraftData(lat: number, lon: number) {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchAircraft = async () => {
      const bbox = calculateBoundingBox(lat, lon);
      const params = new URLSearchParams({
        lamin: String(bbox.lamin),
        lomin: String(bbox.lomin),
        lamax: String(bbox.lamax),
        lomax: String(bbox.lomax)
      });

      try {
        const response = await fetch(`/api/opensky?${params}`);
        const data: OpenSkyResponse = await response.json();

        if (data.states) {
          const parsed = data.states
            .map(parseOpenSkyState)
            .filter(a => 
              !a.on_ground && 
              a.latitude && 
              a.longitude &&
              isCommercialFlight(a.callsign)
            );
          setAircraft(parsed);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch aircraft:', error);
        setLoading(false);
      }
    };

    fetchAircraft();
    const interval = setInterval(fetchAircraft, 15000);

    return () => clearInterval(interval);
  }, [lat, lon]);

  return { aircraft, loading };
}