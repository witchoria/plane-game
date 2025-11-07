'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Aircraft } from '@/types';
import L from 'leaflet';

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
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    // Create icon only on client side
    const planeIcon = L.divIcon({
      html: '<div style="font-size: 32px; text-align: center;">✈️</div>',
      className: 'plane-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    setIcon(planeIcon);
  }, []);

  if (!aircraft.latitude || !aircraft.longitude || !icon) return null;

  return (
    <Marker
      position={[aircraft.latitude, aircraft.longitude]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip permanent direction="top" offset={[0, -20]}>
        <span className="text-xs font-bold">
          {aircraft.callsign || 'Unknown'}
        </span>
      </Tooltip>
    </Marker>
  );
}