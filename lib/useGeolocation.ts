import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError(err.message);
          setLocation({ lat: 37.7749, lon: -122.4194 });
        }
      );
    } else {
      setError('Geolocation not supported');
      setLocation({ lat: 37.7749, lon: -122.4194 });
    }
  }, []);

  return { location, error };
}