'use client';

import { useGeolocation } from '@/lib/useGeolocation';
import { useAircraftData } from '@/lib/useAircraftData';
import MapView from '@/components/MapView';

export default function Home() {
  const { location, error } = useGeolocation();
  const { aircraft, loading } = useAircraftData(
    location?.lat ?? 0, 
    location?.lon ?? 0
  );

  if (!location) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-lg">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapView 
        lat={location.lat} 
        lon={location.lon} 
        aircraft={aircraft}
        onPlaneSelect={(plane) => console.log('Selected:', plane)}
      />
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
          Loading planes...
        </div>
      )}
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg font-bold z-50">
  {aircraft.length} {aircraft.length === 1 ? 'plane' : 'planes'}
</div>
    </div>
  );
}