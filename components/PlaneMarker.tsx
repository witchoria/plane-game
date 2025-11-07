'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Aircraft } from '@/types';

// Dynamic import for Leaflet components
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

export default function PlaneMarker({
  aircraft,
  onClick
}: {
  aircraft: Aircraft;
  onClick: () => void;
}) {
  const [icon, setIcon] = useState<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Import Leaflet only on client side
    import('leaflet').then((L) => {
      const planeIcon = L.divIcon({
        html: '<div style="font-size: 32px; text-align: center; cursor: pointer; pointer-events: auto;">✈️</div>',
        className: 'plane-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      setIcon(planeIcon);
    });
  }, []);

  if (!aircraft.latitude || !aircraft.longitude || !icon) return null;

  return (
    <Marker
      ref={markerRef}
      position={[aircraft.latitude, aircraft.longitude]}
      icon={icon}
      interactive={true}
      eventHandlers={{
        click: () => {
          console.log('Plane clicked (eventHandlers):', aircraft.callsign);
          onClick();
        },
        mouseover: () => {
          console.log('Plane hover:', aircraft.callsign);
        }
      }}
    />
  );
}