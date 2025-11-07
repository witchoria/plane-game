import { Aircraft } from '@/types';

export type FlightPhase = 'landing' | 'takeoff' | 'unknown';

export function detectFlightPhase(aircraft: Aircraft): FlightPhase {
  if (!aircraft.vertical_rate) return 'unknown';

  if (aircraft.vertical_rate < -2) return 'landing';
  if (aircraft.vertical_rate > 2) return 'takeoff';
  
  return 'unknown';
}

export function getGamePrompt(phase: FlightPhase): string {
  switch (phase) {
    case 'landing':
      return 'Guess where this plane is coming from';
    case 'takeoff':
      return 'Guess where this plane is going';
    case 'unknown':
      return 'Guess where this plane is going';
  }
}