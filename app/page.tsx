'use client';

import { useState } from 'react';
import { useGeolocation } from '@/lib/useGeolocation';
import { useAircraftData } from '@/lib/useAircraftData';
import MapView from '@/components/MapView';
import BottomSheet from '@/components/BottomSheet';
import GamePanel from '@/components/GamePanel';
import { Aircraft } from '@/types';

export default function Home() {
  const { location } = useGeolocation();
  const { aircraft, loading } = useAircraftData(
    location?.lat ?? 0, 
    location?.lon ?? 0
  );
  const [selectedPlane, setSelectedPlane] = useState<Aircraft | null>(null);

  const handlePlaneSelect = (plane: Aircraft) => {
    console.log('page.tsx: setSelectedPlane called with', plane.callsign);
    setSelectedPlane(plane);
  };

  console.log('page.tsx: selectedPlane is', selectedPlane?.callsign || 'null', 'isOpen:', !!selectedPlane);

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
        onPlaneSelect={handlePlaneSelect}
      />
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg" style={{ zIndex: 1100 }}>
          Loading planes...
        </div>
      )}
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg font-bold" style={{ zIndex: 1100 }}>
        {aircraft.length} {aircraft.length === 1 ? 'plane' : 'planes'}
      </div>
      
      <BottomSheet
        isOpen={!!selectedPlane}
        onClose={() => {
          console.log('BottomSheet: closing');
          setSelectedPlane(null);
        }}
      >
        {selectedPlane ? (
          <GamePanel
            aircraft={selectedPlane}
            onNewRound={() => {
              console.log('GamePanel: new round');
              setSelectedPlane(null);
            }}
          />
        ) : (
          <div>No plane selected</div>
        )}
      </BottomSheet>
    </div>
  );
}