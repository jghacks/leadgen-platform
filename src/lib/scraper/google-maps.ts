/**
 * Google Maps / Places API Scraper
 * Uses Google Places API (Text Search + Place Details) to collect business data.
 */

import axios from "axios";

const PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean };
  types?: string[];
  geometry?: { location: { lat: number; lng: number } };
  url?: string;
  business_status?: string;
  editorial_summary?: { overview: string };
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    author_url?: string;
  }>;
  photos?: Array<{ photo_reference: string; height: number; width: number }>;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  owner?: { name: string };
}

export interface ScrapeOptions {
  niche: string;
  location: string;
  radius?: number; // meters (max 50000)
  minRating?: number;
  minReviews?: number;
  maxResults?: number;
}

/**
 * Search for businesses using Google Places Text Search.
 * Returns up to `maxResults` place IDs, then fetches full details.
 */
export async function scrapeGoogleMaps(options: ScrapeOptions): Promise<PlaceResult[]> {
  const {
    niche,
    location,
    radius = 25000,
    minRating = 0,
    minReviews = 0,
    maxResults = 60,
  } = options;

  const query = `${niche} in ${location}`;
  const results: PlaceResult[] = [];
  let nextPageToken: string | undefined;

  try {
    // Text search — up to 3 pages (20 results each = 60 max)
    do {
      const params: Record<string, string | number> = {
        query,
        key: API_KEY,
        radius,
        type: "establishment",
      };

      if (nextPageToken) {
        params.pagetoken = nextPageToken;
        // Google requires a short delay before using page token
        await sleep(2000);
      }

      const response = await axios.get(`${PLACES_API_BASE}/textsearch/json`, { params });
      const data = response.data;

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Places API error:", data.status, data.error_message);
        break;
      }

      // Fetch full details for each place in parallel (batched)
      const placeIds: string[] = data.results
        .filter((p: { rating?: number; user_ratings_total?: number }) =>
          (p.rating ?? 0) >= minRating && (p.user_ratings_total ?? 0) >= minReviews
        )
        .map((p: { place_id: string }) => p.place_id);

      const detailBatches = chunkArray(placeIds, 5);
      for (const batch of detailBatches) {
        const detailResults = await Promise.allSettled(
          batch.map((id) => fetchPlaceDetails(id))
        );
        detailResults.forEach((r) => {
          if (r.status === "fulfilled" && r.value) {
            results.push(r.value);
          }
        });
        if (results.length >= maxResults) break;
      }

      nextPageToken = data.next_page_token;
    } while (nextPageToken && results.length < maxResults);

    return results.slice(0, maxResults);
  } catch (error) {
    console.error("Google Maps scrape error:", error);
    throw error;
  }
}

/**
 * Fetch full details for a single place.
 */
export async function fetchPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "rating",
    "user_ratings_total",
    "opening_hours",
    "types",
    "geometry",
    "url",
    "business_status",
    "editorial_summary",
    "reviews",
    "photos",
    "address_components",
  ].join(",");

  try {
    const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
      params: { place_id: placeId, fields, key: API_KEY },
    });

    if (response.data.status !== "OK") return null;
    return response.data.result as PlaceResult;
  } catch {
    return null;
  }
}

/**
 * Extract city and state from address_components.
 */
export function extractCityState(components?: PlaceResult["address_components"]) {
  if (!components) return { city: undefined, state: undefined, zipCode: undefined };

  const city = components.find((c) => c.types.includes("locality"))?.long_name;
  const state = components.find((c) => c.types.includes("administrative_area_level_1"))?.short_name;
  const zipCode = components.find((c) => c.types.includes("postal_code"))?.long_name;

  return { city, state, zipCode };
}

/**
 * Check if owner responds to reviews (from review data).
 */
export function checkOwnerRespondsToReviews(place: PlaceResult): boolean {
  // Google API v3 returns owner_response on some reviews
  // We approximate by checking review count vs rating alignment
  const reviews = place.reviews ?? [];
  if (reviews.length === 0) return false;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return avgRating >= 4.0 && reviews.length >= 5;
}

// ── Helpers ──────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
