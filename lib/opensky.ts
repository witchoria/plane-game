import { Aircraft, OpenSkyResponse } from '@/types';

export function calculateBoundingBox(lat: number, lon: number, radiusKm: number = 50) {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

  return {
    lamin: lat - latDelta,
    lamax: lat + latDelta,
    lomin: lon - lonDelta,
    lomax: lon + lonDelta
  };
}

export function parseOpenSkyState(state: any[]): Aircraft {
  return {
    icao24: state[0],
    callsign: state[1] ? state[1].trim() : null,
    origin_country: state[2],
    latitude: state[6],
    longitude: state[5],
    altitude: state[7],
    velocity: state[9],
    vertical_rate: state[11],
    on_ground: state[8]
  };
}