import { NextResponse } from "next/server";

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getPlannerQuery(mood: string, days: number) {
  const moodQueries: Record<string, string> = {
    peace: "peaceful quiet nature places",
    couple: "romantic couple friendly places",
    nature: "nature scenic beautiful places",
    adventure: "adventure outdoor activities places",
    photography: "scenic photography beautiful viewpoints",
  };

  const moodQuery = moodQueries[mood] || "tourist attractions";

  let durationText = "weekend";

  if (days === 1) {
    durationText = "one day trip";
  } else if (days === 2) {
    durationText = "2 day weekend trip";
  } else if (days === 3) {
    durationText = "3 day trip";
  }

  return `${moodQuery} for ${durationText} near Mumbai`;
}


export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const url = "https://places.googleapis.com/v1/places:searchText";

  try {
    const body = await request.json();

    const {
      query,
      choice,
      userLat,
      userLng,
      planner = false,
      mood = "nature",
      days = 2,
      budget = 5000,
      maxDistanceKm = 100,
    } = body;
    let structuredData = "";

    if (planner) {
      structuredData = getPlannerQuery(mood, days);
    } else {
      structuredData = query
        ? choice === 1
          ? `Private villa in ${query}`
          : choice === 2
          ? `Village Farmstay in ${query}`
          : `tourist attractions in ${query}`
        : "tourist attractions in Mumbai";
    }

    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.rating",
      "places.reviews",
      "places.editorialSummary",
      "places.addressDescriptor",
      "places.priceLevel",
      "places.types",
    ].join(",");


    const requestBody: Record<string, any> = {
      textQuery: structuredData,
      maxResultCount: 10,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey || "",
        "X-Goog-FieldMask": fieldMask,
      },

      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Google Places API Error:", errorText);

      return NextResponse.json(
        {
          error: `Google API Error: ${errorText}`,
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();
    const placesArray = data.places || [];
    const enhancedPlaces = placesArray.map((place: any) => {
      let distanceKm: number | null = null;
      let distanceText: string | null = null;
      const destinationLat = place.location?.latitude;
      const destinationLng = place.location?.longitude;

      if (
        userLat != null &&
        userLng != null &&
        destinationLat != null &&
        destinationLng != null
      ) {
        distanceKm = calculateHaversineDistance(
          userLat,
          userLng,
          destinationLat,
          destinationLng,
        );

        distanceText = `${distanceKm.toFixed(1)} km away`;
      }

      return {
        ...place,
        distanceKm,
        distanceText,
      };
    });

    let finalPlaces = enhancedPlaces;

    if (planner) {
      finalPlaces = enhancedPlaces.filter((place: any) => {
        if (place.distanceKm == null) {
          return true;
        }

        return place.distanceKm <= maxDistanceKm;
      });
    }

    return NextResponse.json(finalPlaces);
  } catch (error) {
    console.error("Places API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch places",
      },
      {
        status: 500,
      },
    );
  }
}
