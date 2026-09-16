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
      } catch (err) {
        console.error("Could not load details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!spot || spot.error) return;

    const resolveMainImage = async () => {
      if (spot.photos?.[0]?.name) {
        setResolvedImageUrl(`/api/places/photo?name=${encodeURIComponent(spot.photos[0].name)}`);
        return;
      }
      
      let spotName = spot.displayName?.text || spot.primaryTypeDisplayName?.text || "garden landscape";
      try {
        const res = await fetch(`/api/places/unsplash?query=${encodeURIComponent(spotName)}`);
        const data = await res.json();
        if (data.imageUrl) {
          setResolvedImageUrl(data.imageUrl);
        } else {
          setResolvedImageUrl('https://unsplash.com');
        }
      } catch {
        setResolvedImageUrl('https://unsplash.com');
      }
    };
    resolveMainImage();
  }, [spot]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-zinc-500 animate-pulse">Gathering complete destination details...</p>
      </div>
    );
  }

  if (!spot || spot.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full text-red-600">📍</div>
        <p className="text-sm text-zinc-500 max-w-xs text-center">Destination details could not be found.</p>
        <button onClick={() => router.push("/dashboard")} className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 md:px-8 text-zinc-900 dark:text-zinc-100 tracking-tight">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.push("/dashboard")} className="mb-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Discovery
        </button>

        <div className="w-full h-72 sm:h-[450px] rounded-3xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800/80 shadow-lg">
          <img src={resolvedImageUrl || undefined} alt={spot.displayName?.text || "Spot destination"} className="w-full h-full object-cover select-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="text-white max-w-2xl">
              {spot.primaryTypeDisplayName?.text && (
                <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 rounded-md mb-2 inline-block">
                  {spot.primaryTypeDisplayName.text}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm">{spot.displayName?.text}</h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-200 font-medium flex items-center gap-1.5 opacity-90">
                <span>📍</span> {spot.formattedAddress}
              </p>
            </div>
            
            {spot.regularOpeningHours && (
              <div className={`px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md shadow-sm self-start sm:self-auto border ${
                spot.regularOpeningHours.openNow 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                ● {spot.regularOpeningHours.openNow ? "Open Now" : "Closed"}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">         
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">About the Experience</h2>
              <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                {spot.editorialSummary?.text || "Discover an exceptional point of interest perfectly embedded within the heart of this destination."}
              </p>
            </div>

            {(spot.accessibilityOptions || spot.parkingOptions || spot.paymentOptions ) && 
             <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              {spot.accessibilityOptions && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">♿ Accessibility Options</h3>
                  <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 font-semibold">
                    <li className={spot.accessibilityOptions.wheelchairAccessibleEntrance ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>
                      {spot.accessibilityOptions.wheelchairAccessibleEntrance ? "✓ Accessible Entrance" : "✗ No Accessible Entrance"}
                    </li>
                    <li className={spot.accessibilityOptions.wheelchairAccessibleParking ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>
                      {spot.accessibilityOptions.wheelchairAccessibleParking ? "✓ Dedicated Parking Spaces" : "✗ No Accessible Parking"}
                    </li>
                    <li className={spot.accessibilityOptions.wheelchairAccessibleRestroom ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>
                      {spot.accessibilityOptions.wheelchairAccessibleRestroom ? "✓ Accessible Restrooms" : "✗ No Accessible Restrooms"}
                    </li>
                  </ul>
                </div>
              )}
              {spot.parkingOptions && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">🚗 Parking Infrastructure</h3>
                  <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 font-semibold">
                    <li className={spot.parkingOptions.paidParkingLot ? "text-amber-600 dark:text-amber-400" : "opacity-40"}>
                      {spot.parkingOptions.paidParkingLot ? "🅿 Paid Parking Lot Available" : "No Paid Parking Lot"}
                    </li>
                    <li className={spot.parkingOptions.freeStreetParking ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>
                      {spot.parkingOptions.freeStreetParking ? "✓ Free Street Parking Available" : "No Free Street Parking"}
                    </li>
                    <li className={spot.parkingOptions.paidStreetParking ? "text-amber-600 dark:text-amber-400" : "opacity-40"}>
                      {spot.parkingOptions.paidStreetParking ? "⚠️ Paid Street Parking Applies" : "No Paid Street Parking"}
                    </li>
                  </ul>
                </div>
              )}
              {spot.paymentOptions && (
                <div className="flex flex-col gap-2 sm:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">💳 Accepted Payments</h3>
                  <div className="flex gap-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    <p className={spot.paymentOptions.acceptsDebitCards ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      {spot.paymentOptions.acceptsDebitCards ? "✓ Debit / Credit Cards Accepted" : ""}
                    </p>
                    <p className={spot.paymentOptions.acceptsCashOnly ? "text-amber-600 dark:text-amber-500" : ""}>
                      {spot.paymentOptions.acceptsCashOnly ? "💵 Cash Only Required" : "✓ Electronic Payments Supported"}
                    </p>
                  </div>
                </div>
              )}
            </div>}
            {spot.addressDescriptor?.landmarks && spot.addressDescriptor.landmarks.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">📍 Nearby Landmark References</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {spot.addressDescriptor.landmarks.map((landmark: any, index: number) => {
                    const landmarkId = landmark.placeId || landmark.name?.split('/').pop();
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (landmarkId) {
                            router.push(`/place/${landmarkId}`);
                          }
                        }}
                        className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800/40 text-left hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group cursor-pointer duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {landmark.displayName?.text}
                          </p>
                          <span className="text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5 text-sm select-none">
                            →
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] mt-0.5 capitalize">
                          {landmark.spatialRelationship?.replace(/_/g, ' ').toLowerCase()} landmark
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Community Reviews</h2>
                {spot.userRatingCount && (
                  <span className="text-xs text-zinc-400 font-medium">Based on {spot.userRatingCount.toLocaleString()} submissions</span>
                )}
              </div>

              {spot.reviews && spot.reviews.length > 0 ? (
                <div className="flex flex-col gap-6 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {spot.reviews.slice(0, 3).map((review: any, i: number) => (
                    <div key={i} className={i > 0 ? "pt-5" : ""}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{review.authorAttribution?.displayName}</span>
                        <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg">★ {review.rating}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium italic">
                        "{review.text?.text}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl opacity-40">📊</span>
                  <p className="text-xs text-zinc-400 font-medium max-w-sm text-center">No internal payload reviews. Browse or write verified evaluations directly on the native Google Maps platform.</p>
                  {spot.googleMapsLinks?.reviewsUri && (
                    <a href={spot.googleMapsLinks.reviewsUri} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1">
                      Read External Reviews On Maps →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column Operational / Geo Info Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm flex flex-col gap-5">
              <h2 className="font-black text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">Operational Meta</h2>
              
              {/* Score Indicators */}
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs font-bold text-zinc-500">Google Rating</span>
                <div className="flex items-center gap-1">
                  <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">★ {spot.rating || "N/A"}</span>
                  <span className="text-xs text-zinc-400">/ 5.0</span>
                </div>
              </div>

              {/* Geographic Location/Plus Code Card */}
              {spot.plusCode && (
                <div className="flex flex-col gap-1 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Global Plus Code</span>
                  <code className="font-mono text-zinc-700 dark:text-zinc-300 select-all font-bold">{spot.plusCode.globalCode}</code>
                  <span className="text-[10px] text-zinc-400 italic mt-0.5">{spot.plusCode.compoundCode}</span>
                </div>
              )}

              {/* Detailed Coordinates Data */}
              {spot.location && (
                <div className="flex flex-col gap-1 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Coordinates</span>
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
                    <span>Lat: {spot.location.latitude?.toFixed(5)}</span>
                    <span>Lng: {spot.location.longitude?.toFixed(5)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 text-xs border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Weekly Hours</span>
                {spot.regularOpeningHours?.weekdayDescriptions ? (
                  <div className="flex flex-col gap-1.5 font-semibold text-zinc-600 dark:text-zinc-400 mt-1 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    {spot.regularOpeningHours.weekdayDescriptions.map((day: string, idx: number) => {
                      const isToday = idx === (new Date().getDay() + 6) % 7; 
                      return (
                        <p key={idx} className={`text-[11px] flex justify-between ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''}`}>
                          <span>{day.split(': ')[0]}</span>
                          <span className="font-medium text-right">{day.split(': ')[1]}</span>
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg text-center mt-1">
                    Open for Regular Bookings
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                {spot.websiteUri && (
                  <a href={spot.websiteUri} target="_blank" rel="noreferrer" className="block w-full text-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-xs py-3 rounded-xl transition-all">
                    🔗 Launch Official Website
                  </a>
                )}
                
                {(spot.googleMapsLinks?.directionsUri || spot.googleMapsLinks?.placeUri) && (
                  <a 
                    href={spot.googleMapsLinks?.directionsUri || spot.googleMapsLinks?.placeUri}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
                  >
                    🗺️ Navigate on Google Maps
                  </a>
                )}

                {spot.googleMapsLinks?.writeAReviewUri && (
                  <a 
                    href={spot.googleMapsLinks.writeAReviewUri}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    ✏️ Leave a Google Review
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
