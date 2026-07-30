import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const photoName = searchParams.get('name'); 
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!photoName) {
    return new NextResponse('Missing photo name', { status: 400 });
  }

  const url = `https://places.googleapis.com/v1/places/${photoName}/media?key=${apiKey}&maxHeightPx=1000`;

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse('Failed to fetch image', { status: res.status });
    
    const blob = await res.blob();
    return new NextResponse(blob, { headers: { 'Content-Type': blob.type } });
  } catch {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
