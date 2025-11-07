import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lamin = searchParams.get('lamin');
  const lomin = searchParams.get('lomin');
  const lamax = searchParams.get('lamax');
  const lomax = searchParams.get('lomax');

  if (!lamin || !lomin || !lamax || !lomax) {
    return Response.json({ error: 'Missing bounding box parameters' }, { status: 400 });
  }

  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  try {
    // Add authentication if credentials are available
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    const headers: HeadersInit = {};

    if (username && password) {
      // Use Basic Authentication
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
      console.log('Using OpenSky authentication');
    } else {
      console.log('Using OpenSky without authentication (rate limited)');
    }

    const response = await fetch(url, {
      headers,
      // Add timeout to prevent long waits
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`OpenSky API error: ${response.status} ${response.statusText}`);
      return Response.json(
        { error: `OpenSky API returned ${response.status}`, states: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch from OpenSky:', error);
    // Return empty states instead of error to prevent app from breaking
    return Response.json({
      time: Math.floor(Date.now() / 1000),
      states: null
    });
  }
}