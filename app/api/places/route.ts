import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = 'https://places.googleapis.com/v1/places:searchText';

  try {
    const {query,choice} = await request.json();
    const structuredData = query ? (choice === 1) ? `Private villa in ${query}` : (choice === 2) ? `Village Farmstay in ${query}` : `tourist attractions in ${query}` : "tourist attractions in Mumbai";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey || '',
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.reviews'
      },
      body: JSON.stringify({
        textQuery: structuredData,
        maxResultCount: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Google API Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.places || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
