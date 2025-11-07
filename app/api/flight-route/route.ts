import { NextRequest } from 'next/server';

interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface FlightRoute {
  origin: AirportInfo | null;
  destination: AirportInfo | null;
  callsign: string;
  icao24: string;
  source?: string;
}

/**
 * API endpoint to look up flight route information
 * Hybrid approach: OpenSky → AviationStack → Google Search
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callsign = searchParams.get('callsign')?.trim();
  const icao24 = searchParams.get('icao24');

  if (!callsign || !icao24) {
    return Response.json(
      { error: 'Missing callsign or icao24 parameter' },
      { status: 400 }
    );
  }

  console.log('Looking up route for:', callsign);

  try {
    // Step 1: Try OpenSky Network
    const openskyResult = await tryOpenSky(callsign);
    if (openskyResult) {
      console.log('✓ Found route via OpenSky');
      return Response.json({ ...openskyResult, callsign, icao24, source: 'OpenSky' });
    }

    // Step 2: Try AviationStack API
    const aviationstackResult = await tryAviationStack(callsign);
    if (aviationstackResult) {
      console.log('✓ Found route via AviationStack');
      return Response.json({ ...aviationstackResult, callsign, icao24, source: 'AviationStack' });
    }

    // Step 3: Try Google Search scraping
    const googleResult = await tryGoogleSearch(callsign);
    if (googleResult) {
      console.log('✓ Found route via Google Search');
      return Response.json({ ...googleResult, callsign, icao24, source: 'Google' });
    }

    // All methods failed
    console.log('✗ No route data found for', callsign);
    return Response.json({
      origin: null,
      destination: null,
      callsign,
      icao24,
      error: 'Route data not available from any source'
    });
  } catch (error) {
    console.error('Error fetching flight route:', error);
    return Response.json(
      { error: 'Failed to fetch flight route', callsign, icao24 },
      { status: 500 }
    );
  }
}

/**
 * Try to get route from OpenSky Network
 */
async function tryOpenSky(callsign: string): Promise<{ origin: AirportInfo; destination: AirportInfo } | null> {
  try {
    const url = `https://opensky-network.org/api/routes?callsign=${callsign}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.route || data.route.length === 0) return null;

    const route = data.route[0];
    const [originCode, destCode] = route.split('-');

    if (!originCode || !destCode) return null;

    const origin = await lookupAirport(originCode);
    const destination = await lookupAirport(destCode);

    if (!origin || !destination) return null;

    return { origin, destination };
  } catch (error) {
    console.error('OpenSky error:', error);
    return null;
  }
}

/**
 * Try to get route from AviationStack API
 */
async function tryAviationStack(callsign: string): Promise<{ origin: AirportInfo; destination: AirportInfo } | null> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    console.log('AviationStack API key not configured');
    return null;
  }

  try {
    // Extract flight number from callsign (e.g., "UAL123" -> "UA123")
    const flightNumber = extractFlightNumber(callsign);
    if (!flightNumber) return null;

    const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`;
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.data || data.data.length === 0) return null;

    const flight = data.data[0];
    const departure = flight.departure;
    const arrival = flight.arrival;

    if (!departure || !arrival) return null;

    const origin: AirportInfo = {
      code: departure.iata || departure.icao || 'Unknown',
      name: departure.airport || 'Unknown Airport',
      city: departure.timezone?.split('/')[1] || 'Unknown',
      country: departure.timezone?.split('/')[0] || 'Unknown'
    };

    const destination: AirportInfo = {
      code: arrival.iata || arrival.icao || 'Unknown',
      name: arrival.airport || 'Unknown Airport',
      city: arrival.timezone?.split('/')[1] || 'Unknown',
      country: arrival.timezone?.split('/')[0] || 'Unknown'
    };

    return { origin, destination };
  } catch (error) {
    console.error('AviationStack error:', error);
    return null;
  }
}

/**
 * Try to get route from Google Search
 */
async function tryGoogleSearch(callsign: string): Promise<{ origin: AirportInfo; destination: AirportInfo } | null> {
  try {
    // Extract flight number for search
    const flightNumber = extractFlightNumber(callsign);
    if (!flightNumber) return null;

    const searchQuery = `${flightNumber} flight route origin destination`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Try to extract airport codes from the HTML
    // Google often shows "XXX to YYY" format in snippets
    const airportRegex = /([A-Z]{3})\s+(?:to|→|-)\s+([A-Z]{3})/;
    const match = html.match(airportRegex);

    if (!match) return null;

    const [, originCode, destCode] = match;
    const origin = await lookupAirport(originCode);
    const destination = await lookupAirport(destCode);

    if (!origin || !destination) return null;

    return { origin, destination };
  } catch (error) {
    console.error('Google search error:', error);
    return null;
  }
}

/**
 * Extract flight number from callsign
 * Examples: "UAL123" -> "UA123", "SWA456" -> "WN456"
 */
function extractFlightNumber(callsign: string): string | null {
  if (!callsign || callsign.length < 4) return null;

  // Remove trailing spaces and convert to uppercase
  const cleaned = callsign.trim().toUpperCase();

  // Try to match pattern: 2-3 letters + numbers
  const match = cleaned.match(/^([A-Z]{2,3})(\d+)$/);
  if (!match) return null;

  const [, airline, number] = match;

  // Map ICAO airline codes to IATA codes (common ones)
  const icaoToIata: { [key: string]: string } = {
    'UAL': 'UA', 'SWA': 'WN', 'AAL': 'AA', 'DAL': 'DL',
    'FDX': 'FX', 'UPS': '5X', 'BAW': 'BA', 'AFR': 'AF',
    'DLH': 'LH', 'KLM': 'KL', 'ACA': 'AC', 'JBU': 'B6'
  };

  const iataCode = icaoToIata[airline] || airline.substring(0, 2);
  return `${iataCode}${number}`;
}

/**
 * Look up airport information by IATA/ICAO code
 */
async function lookupAirport(code: string): Promise<AirportInfo | null> {
  if (!code || code === 'Unknown') return null;

  // Use a public airport API or database
  // For now, using a simple mapping approach with common airports
  const airports = getAirportDatabase();
  const airport = airports[code.toUpperCase()];

  if (airport) {
    return {
      code: code.toUpperCase(),
      ...airport
    };
  }

  // If not in database, return basic info
  return {
    code: code.toUpperCase(),
    name: `${code} Airport`,
    city: 'Unknown',
    country: 'Unknown'
  };
}

/**
 * Basic airport database (top 100 busiest airports)
 * In production, this would be a proper database or API call
 */
function getAirportDatabase(): { [key: string]: { name: string; city: string; country: string } } {
  return {
    // US Airports
    'ATL': { name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States' },
    'LAX': { name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
    'ORD': { name: "O'Hare International", city: 'Chicago', country: 'United States' },
    'DFW': { name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States' },
    'DEN': { name: 'Denver International', city: 'Denver', country: 'United States' },
    'JFK': { name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
    'SFO': { name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
    'SEA': { name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States' },
    'LAS': { name: 'Harry Reid International', city: 'Las Vegas', country: 'United States' },
    'MCO': { name: 'Orlando International', city: 'Orlando', country: 'United States' },
    'EWR': { name: 'Newark Liberty International', city: 'Newark', country: 'United States' },
    'MIA': { name: 'Miami International', city: 'Miami', country: 'United States' },
    'PHX': { name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States' },
    'IAH': { name: 'George Bush Intercontinental', city: 'Houston', country: 'United States' },
    'BOS': { name: 'Logan International', city: 'Boston', country: 'United States' },

    // International Airports
    'LHR': { name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
    'CDG': { name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    'FRA': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    'AMS': { name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    'MAD': { name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
    'BCN': { name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain' },
    'DXB': { name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
    'HND': { name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
    'NRT': { name: 'Narita International', city: 'Tokyo', country: 'Japan' },
    'ICN': { name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
    'SIN': { name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
    'HKG': { name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },
    'PEK': { name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
    'PVG': { name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China' },
    'YYZ': { name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
    'YVR': { name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
    'MEX': { name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
    'GRU': { name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil' },
    'SYD': { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
    'MEL': { name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' }
  };
}
