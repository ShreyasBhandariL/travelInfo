'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SpotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('');


  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/places/details?placeId=${id}`);
        const data = await res.json();
        setSpot(data);
        console.log(data)
      } catch (err) {
        console.error("Could not load details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if(!spot || spot.error) return;

    const resolveMainImage = async () => {
        if (spot.photos?.[0]?.name) {
        setResolvedImageUrl(`/api/places/photo?name=${encodeURIComponent(spot.photos[0].name)}`);
        return;
      }
      let spotName = spot.displayName?.text || "luxury stay";

      const res = await fetch(`/api/places/unsplash?query=${encodeURIComponent(spotName)}`);
      const data = await res.json()
      if (data.imageUrl) {
          setResolvedImageUrl(data.imageUrl);
        } else {
          setResolvedImageUrl('https://unsplash.com');
        }
    }
    resolveMainImage();
  },[spot])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-500 animate-pulse">Gathering complete destination details...</p>
      </div>
    );
  }

  if (!spot || spot.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Destination details could not be found.</p>
        <button onClick={() => router.back()} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg">Go Back</button>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto">
        
        
        <button onClick={() => router.back()} className="mb-6 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
          ← Back to Results
        </button>

        <div className="w-full h-64 sm:h-[450px] rounded-2xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800 shadow-md">
          <img src={resolvedImageUrl || 'https://unsplash.com'} alt={spot.displayName?.text} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{spot.displayName?.text}</h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-200 flex items-center gap-1">📍 {spot.formattedAddress}</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">About This Spot</h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {spot.editorialSummary?.text || "Enjoy an incredible stay experience right in this premium location. Explore the beauty, local culture, and high-tier amenities tailored for your perfect getaway holiday."}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Visitor Reviews</h2>
              {spot.reviews && spot.reviews.length > 0 ? (
                <div className="flex flex-col gap-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {spot.reviews.slice(0, 3).map((review: any, i: number) => (
                    <div key={i} className={i > 0 ? "pt-4" : ""}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{review.authorAttribution?.displayName}</span>
                        <span className="text-xs text-yellow-500">⭐ {review.rating}</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-3">"{review.text?.text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No recent reviews available.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
              <h2 className="font-bold text-sm uppercase tracking-wide border-b border-zinc-100 dark:border-zinc-800 pb-2">Quick Quick Information</h2>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Rating Score</span>
                <span className="font-bold text-yellow-500 text-sm">⭐ {spot.rating || "N/A"} / 5</span>
              </div>

              {spot.internationalPhoneNumber && (
                <div className="flex flex-col gap-0.5 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-zinc-400">Phone Number</span>
                  <span className="font-semibold">{spot.internationalPhoneNumber}</span>
                </div>
              )}

              <div className="flex flex-col gap-1 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-zinc-400">Schedule Hours</span>
                {spot.regularOpeningHours?.weekdayDescriptions ? (
                  <div className="flex flex-col gap-0.5 font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-h-24 overflow-y-auto pr-1">
                    {spot.regularOpeningHours.weekdayDescriptions.map((day: string, idx: number) => (
                      <p key={idx} className="text-[11px]">{day}</p>
                    ))}
                  </div>
                ) : (
                  <span className="font-semibold text-green-600">Open for Reservations</span>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {spot.websiteUri && (
                  <a href={spot.websiteUri} target="_blank" rel="noreferrer" className="block w-full text-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs py-2 rounded-lg transition-colors">
                    Visit Official Website
                  </a>
                )}
                <a 
                  href={spot.googleMapsLinks?.placeUri}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors"
                >
                  Get Directions (Maps)
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
