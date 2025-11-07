export interface Aircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  vertical_rate: number | null;
  on_ground: boolean;
}

export interface OpenSkyResponse {
  time: number;
  states: any[][] | null;
}