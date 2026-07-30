// app/api/places/details/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId parameter' }, { status: 400 });
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey || '',
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,editorialSummary,rating,regularOpeningHours,internationalPhoneNumber,websiteUri,photos,reviews,googleMapsLinks'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Google API Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch detailed data' }, { status: 500 });
  }
}
