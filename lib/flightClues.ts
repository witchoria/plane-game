import { Aircraft } from '@/types';

export type RouteType = 'domestic' | 'international' | 'unknown';
export type Duration = 'short' | 'long' | 'unknown';

export interface FlightClues {
  routeType: RouteType;
  duration: Duration;
  durationThreshold: string;
}

/**
 * Calculate flight clues from aircraft data
 * For now returns 'unknown' - will be updated when we have route/destination API
 */
export function calculateFlightClues(aircraft: Aircraft): FlightClues {
  // TODO: Implement actual route lookup via API
  // For now, return unknown until we have origin/destination data

  return {
    routeType: 'unknown',
    duration: 'unknown',
    durationThreshold: 'TBD'
  };
}

/**
 * Determine if a route is domestic or international
 * @param originCountry - ISO country code of origin
 * @param destinationCountry - ISO country code of destination
 */
export function determineRouteType(
  originCountry: string,
  destinationCountry: string
): RouteType {
  if (!originCountry || !destinationCountry) return 'unknown';
  return originCountry === destinationCountry ? 'domestic' : 'international';
}

/**
 * Determine if flight duration is short or long
 * @param durationMinutes - Flight duration in minutes
 * @param isDomestic - Whether the flight is domestic
 */
export function determineDuration(
  durationMinutes: number,
  isDomestic: boolean
): { duration: Duration; threshold: string } {
  if (!durationMinutes || durationMinutes <= 0) {
    return { duration: 'unknown', threshold: 'TBD' };
  }

  const thresholdHours = isDomestic ? 3 : 7;
  const thresholdMinutes = thresholdHours * 60;

  return {
    duration: durationMinutes < thresholdMinutes ? 'short' : 'long',
    threshold: `${thresholdHours}hr`
  };
}
