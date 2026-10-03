"use client";

import Logout from "../components/logout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocation } from "../context/LocationContext";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Places {
  id: string;
  name: string;
  category: string;
  description: string;
  coordinates: Coordinates;
  distanceText: string | null;
  amenities: string[];
  rating?: number;
  priceLevel?: string;
}

interface DashboardClientProps {
  session: any;
}

interface MumbaiPlaces {
  id: string;
  name: string;
  description: string;
  distanceText: string | null;
  areas: string;
}

interface PlannerPlace {
  id: string;
  name: string;
  description: string;
  distanceText: string | null;
  rating?: number;
  priceLevel?: string;
  category: string;
}

export default function DashboardPage({ session }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPlaces, setFilteredPlaces] = useState<Places[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [choice, setChoice] = useState<number>(1);
  const [mumbaiPlaces, setMumbaiPlaces] = useState<MumbaiPlaces[]>([]);
  const { userCoords } = useLocation();
  const [plannerMood, setPlannerMood] = useState<string>("nature");
  const [plannerDays, setPlannerDays] = useState<number>(2);
  const [plannerBudget, setPlannerBudget] = useState<number>(5000);
  const [plannerDistance, setPlannerDistance] = useState<number>(100);
  const [plannerPlaces, setPlannerPlaces] = useState<PlannerPlace[]>([]);
  const [showPlannerResults, setShowPlannerResults] = useState<boolean>(false);
  const [plannerLoading, setPlannerLoading] = useState<boolean>(false);
  const [plannerError, setPlannerError] = useState<string>("");


  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Private Villa") {
      setChoice(1);
    } else if (e.target.value === "Village Farmstay") {
      setChoice(2);
    } else {
      setChoice(3);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setSearchQuery(val);

    if (val.trim() === "") {
      setFilteredPlaces([]);
      setShow(false);
      return;
    }

    setShow(true);
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: undefined,
            choice: choice,
          }),
        });

        const places = await res.json();

        if (!Array.isArray(places)) {
          return;
        }

        const mappedPlaces = places.map((place: any, index: number) => {
          const areas = place.addressDescriptor?.areas || [];
          const areaText = areas.map((areaItem: any) => areaItem.displayName?.text).filter(Boolean).join(", ") || "Mumbai, Maharashtra";

          return {
            id: place.id || String(index),
            name: place.displayName?.text || "Unknown Spot",
            description:place.editorialSummary?.text || "Mumbai, Maharashtra, India",
            distanceText: place.distanceText || null,
            areas: areaText,
          };
        });

        setMumbaiPlaces(mappedPlaces);
      } catch (error) {
        console.error("Failed to fetch popular places:", error);
      }
    };

    fetchPlaces();
  }, []);

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          query: searchQuery,
          choice: choice,
          userLat: userCoords?.lat ?? null,
          userLng: userCoords?.lng ?? null,
        }),
      });

      const places = await res.json();

      if (!Array.isArray(places)) {
        return;
      }

      const mappedPlaces = places.map((place: any, index: number) => ({
        id: place.id || String(index),
        name: place.displayName?.text || "Unknown Spot",
        category:
          choice === 1
            ? "Private Villa"
            : choice === 2
            ? "Village Farmstay"
            : "Tourist Attraction",
        description: place.formattedAddress || "Mumbai, Maharashtra, India",
        coordinates: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
        distanceText: place.distanceText || null,
        amenities: ["Rating: " + (place.rating || "N/A")],
        rating: place.rating,
        priceLevel: place.priceLevel,
      }));
      setFilteredPlaces(mappedPlaces);
      setShow(true);
    } catch (error) {
      console.error("Failed to compile API destination request data:", error);
    }
  };

  const handleWeekendPlanner = async () => {
    try {
      setPlannerLoading(true);
      setPlannerError("");
      setShowPlannerResults(false);

      const res = await fetch("/api/places", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          planner: true,
          mood: plannerMood,
          days: plannerDays,
          budget: plannerBudget,
          maxDistanceKm: plannerDistance,
          userLat: userCoords?.lat ?? null,
          userLng: userCoords?.lng ?? null,
        }),
      });

      const places = await res.json();

      if (!res.ok || !Array.isArray(places)) {
        throw new Error(places?.error || "Failed to find places");
      }

      const mappedPlaces = places.map((place: any, index: number) => ({
        id: place.id || String(index),
        name: place.displayName?.text || "Unknown Spot",
        description:place.editorialSummary?.text || place.formattedAddress || "Mumbai, Maharashtra",
        distanceText: place.distanceText || null,
        rating: place.rating,
        priceLevel: place.priceLevel,
        category: "Recommended",
      }));

      setPlannerPlaces(mappedPlaces);

      setShowPlannerResults(true);
    } catch (error) {
      console.error("Weekend planner error:", error);

      setPlannerError(
        "Unable to find weekend places right now. Please try again.",
      );
    } finally {
      setPlannerLoading(false);
    }
  };

  const getPriceLabel = (priceLevel?: string) => {
    switch (priceLevel) {
      case "PRICE_LEVEL_FREE":
        return "Free";

      case "PRICE_LEVEL_INEXPENSIVE":
        return "Budget";

      case "PRICE_LEVEL_MODERATE":
        return "Moderate";

      case "PRICE_LEVEL_EXPENSIVE":
        return "Premium";

      case "PRICE_LEVEL_VERY_EXPENSIVE":
        return "Luxury";

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">

      <header className="flex items-center justify-between px-8 sm:px-4 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            MumbaiGetaways
          </span>
        </div>

        {!session ? (
          <Link
            href="/account/sign-in"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-all"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-blue-500 shadow-sm"
              />
            )}

            <div className="hidden sm:flex flex-col text-left text-xs gap-0.5">
              <span className="font-bold text-zinc-900 dark:text-white leading-none">
                {session?.user?.name}
              </span>

              <span className="text-zinc-500 dark:text-zinc-400 text-[10px] leading-none">
                {session?.user?.email}
              </span>
            </div>

            <div className="border-l border-zinc-200 dark:border-zinc-700 pl-2">
              <Logout username={session?.user?.name} />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-12 py-16 px-6 sm:px-12">

        <section className="flex flex-col gap-4 text-center sm:text-start">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            Weekend Escapes for Mumbaikars
          </h1>

          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
            Book peaceful villas or village farmstays outside Mumbai—and uncover
            secret, hidden tourist spots nearby that only locals know about.
          </p>
        </section>

        <div className="flex flex-col gap-4 w-full">
          <section className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md">
            <form
              onSubmit={handleForm}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  Where to spend holiday ?
                </label>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search Alibaug, Karjat, Lonavala, Igatpuri..."
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1 sm:w-44">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                  Stay Style
                </label>

                <select
                  onChange={handleSelectChange}
                  value={
                    choice === 1
                      ? "Private Villa"
                      : choice === 2
                      ? "Village Farmstay"
                      : "Places to Visit"
                  }
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                >
                  <option value="Private Villa">Private Villa</option>

                  <option value="Village Farmstay">Village Farmstay</option>

                  <option value="Places to Visit">Places to Visit</option>
                </select>
              </div>

              <button
                type="submit"
                className="sm:mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2 rounded-lg cursor-pointer transition-all self-stretch sm:self-auto disabled:cursor-not-allowed disabled:opacity-50"
                disabled={searchQuery.trim() === ""}
              >
                Explore Spots
              </button>
            </form>
          </section>

          {show && (
            <div className="w-full bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col gap-4">
              {filteredPlaces.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Found {filteredPlaces.length} destination match(es)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredPlaces.map((place) => (
                      <Link
                        key={place.id}
                        href={`/place/${place.id}`}
                        className="block cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
                          <div className="mb-4">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                {place.name}
                              </h3>

                              <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                {place.category}
                              </span>
                            </div>

                            {place.distanceText && (
                              <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-2 bg-emerald-500/5 py-1 px-2 rounded-md border border-emerald-500/10 w-fit">
                                📍 {place.distanceText}
                              </p>
                            )}

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                              {place.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {place.amenities.map((amenity, i) => (
                              <span
                                key={i}
                                className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px] px-2 py-0.5 rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Click Explore Spots to see places found for `{searchQuery}`
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <section className="w-full bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md">

          <div className="mb-7">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              ✨ Smart Travel Planner
            </span>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
              Plan My Weekend
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Tell us what kind of escape you want and discover real places
              around Mumbai that match your preferences.
            </p>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              What&apos;s your vibe?
            </label>

            <div className="flex flex-wrap gap-2 mt-3">
              {[
                ["peace", "😌 Peaceful"],
                ["couple", "❤️ Couple"],
                ["nature", "🌿 Nature"],
                ["adventure", "🔥 Adventure"],
                ["photography", "📸 Photography"],
              ].map((item) => {
                const [value, label] = item;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlannerMood(value)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      plannerMood === value
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              How long do you have?
            </label>

            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setPlannerDays(day)}
                  className={`px-5 py-2 rounded-lg border text-sm transition-all ${
                    plannerDays === day
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {day} {day === 1 ? "Day" : "Days"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Budget preference
            </label>

            <p className="text-[11px] text-zinc-400 mt-1">
              Based on Google Places price category, not total trip cost.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {[2000, 5000, 10000, 20000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setPlannerBudget(amount)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    plannerBudget === amount
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  ₹{amount / 1000}K
                </button>
              ))}
            </div>
          </div>

          <div className="mb-7">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Maximum distance
              </label>

              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {plannerDistance} km
              </span>
            </div>

            <input
              type="range"
              min="25"
              max="250"
              step="25"
              value={plannerDistance}
              onChange={(e) => setPlannerDistance(Number(e.target.value))}
              className="w-full mt-4 accent-emerald-600"
            />

            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>25 km</span>

              <span>250 km</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleWeekendPlanner}
            disabled={plannerLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {plannerLoading ? "Finding your escape..." : "✨ Plan My Weekend"}
          </button>

          {plannerError && (
            <p className="text-sm text-red-500 text-center mt-4">
              {plannerError}
            </p>
          )}
        </section>

        {showPlannerResults && (
          <section className="w-full bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="mb-6">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                ✨ Your weekend matches
              </span>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Places you might love
              </h2>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Recommendations are based on your selected preferences and
                Google Places results.
              </p>
            </div>

            {plannerPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plannerPlaces.map((place) => (
                  <Link
                    key={place.id}
                    href={`/place/${place.id}`}
                    className="block cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                          {place.name}
                        </h3>

                        <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0">
                          Recommended
                        </span>
                      </div>

                      {place.distanceText && (
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3 bg-emerald-500/5 py-1.5 px-2 rounded-md border border-emerald-500/10 w-fit">
                          📍 {place.distanceText}
                        </p>
                      )}

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mt-3">
                        {place.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {place.rating && (
                          <span className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] px-2 py-1 rounded-full">
                            ⭐ {place.rating}
                          </span>
                        )}

                        {getPriceLabel(place.priceLevel) && (
                          <span className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] px-2 py-1 rounded-full">
                            💰 {getPriceLabel(place.priceLevel)}
                          </span>
                        )}

                        <span className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] px-2 py-1 rounded-full">
                          {plannerDays} day
                          {plannerDays > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Explore this place →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No places matched your current preferences.
                </p>

                <p className="text-xs text-zinc-400 mt-1">
                  Try increasing the maximum distance or budget.
                </p>
              </div>
            )}
          </section>
        )}

        {mumbaiPlaces?.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Popular Holiday Clusters
              </h2>

              <p className="text-xs text-zinc-500">
                Pick a hub to discover curated homes and hidden surrounding
                trails.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mumbaiPlaces.map((place) => (
                <div
                  key={place.id}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xl flex flex-col gap-3 justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {place.name}
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {place.description}
                    </p>

                    <div className="mt-3 bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700 p-2.5 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Hidden Gem Nearby:
                      </span>

                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                        {place.areas}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <Link
                      href={`/place/${place.id}`}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block mt-2 self-start"
                    >
                      View Stays & Secrets →
                    </Link>

                    {place.distanceText && (
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/5 py-1 px-2 rounded-md border border-emerald-500/10 w-fit">
                        📍 {place.distanceText}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full text-center py-6 text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 text-[11px] bg-white dark:bg-black">
        &copy; {new Date().getFullYear()} MumbaiGetaways Inc. Finding hidden
        footprints.
      </footer>
    </div>
  );
}
