import { NextResponse } from 'next/server';

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = 'https://places.googleapis.com/v1/places:searchText';

  try {
    const {query,choice, userLat, userLng} = await request.json();
    const structuredData = query ? (choice === 1) ? `Private villa in ${query}` : (choice === 2) ? `Village Farmstay in ${query}` : `tourist attractions in ${query}` : "tourist attractions in Mumbai";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey || '',
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.reviews,places.editorialSummary,places.addressDescriptor'
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
    const placesArray = data.places || [];
    const enhancedPlaces = placesArray.map((place: any) => {
      let distanceText = null;
      
      const destinationLat = place.location?.latitude;
      const destinationLng = place.location?.longitude;

      if (userLat && userLng && destinationLat && destinationLng) {
        const distanceKm = calculateHaversineDistance(userLat, userLng, destinationLat, destinationLng);
        distanceText = `${distanceKm.toFixed(1)} km away`;
      }

      return {
        ...place,
        distanceText 
      };
    });
    return NextResponse.json(enhancedPlaces);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
