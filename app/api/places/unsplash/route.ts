import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const accessKey = process.env.UNSPLASH_ACCESS_KEY; 

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const url = `https://api.unsplash.com/search/photos?client_id=${accessKey}&query=${encodeURIComponent(query)}&per_page=1`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${accessKey}`, 
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("UNSPLASH API ERROR:", errText);
      return NextResponse.json({ error: 'Unsplash fetch failed' }, { status: res.status });
    }

    const data = await res.json();
    const imageUrl = data.results?.[0]?.urls?.regular || null;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("INTERNAL UNSPLASH ROUTE PANIC:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
