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

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightRoute {
  origin: AirportInfo | null;
  destination: AirportInfo | null;
  callsign: string;
  icao24: string;
  source?: string;
  error?: string;
}