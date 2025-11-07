'use client';

import dynamic from 'next/dynamic';
import { useMemo, useEffect, useState } from 'react';
import PlaneMarker from './PlaneMarker';
import { Aircraft } from '@/types';
import L from 'leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

export default function MapView({ 
  lat, 
  lon,
  aircraft = [],
  onPlaneSelect
}: { 
  lat: number; 
  lon: number;
  aircraft?: Aircraft[];
  onPlaneSelect?: (aircraft: Aircraft) => void;
}) {
  const position = useMemo(() => [lat, lon] as [number, number], [lat, lon]);
  const [userIcon, setUserIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    // Create user location icon on client side
    const icon = L.divIcon({
      html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    setUserIcon(icon);
  }, []);

  if (!userIcon) return <div className="h-screen w-full bg-gray-100" />;

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={position}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
        doubleClickZoom={false}
        preferCanvas={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={userIcon} />
        
        {aircraft.map(plane => (
          <PlaneMarker
            key={plane.icao24}
            aircraft={plane}
            onClick={() => {
              console.log('MapView: onClick called for', plane.callsign);
              onPlaneSelect?.(plane);
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}