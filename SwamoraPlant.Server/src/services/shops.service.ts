/**
 * Finds nearby shops that may stock a recommended treatment.
 *
 * If GOOGLE_MAPS_API_KEY is set, calls the Google Places API (Nearby Search + Text Search).
 * Otherwise, returns a small set of mock results so the rest of the flow stays testable.
 */

export interface ShopLocation {
  lat: number;
  lng: number;
}

export interface Shop {
  name: string;
  address: string;
  location: ShopLocation;
  distanceMeters?: number;
  rating?: number;
  mapsUrl: string;
}

export interface FindShopsParams {
  location: ShopLocation;
  productKeywords: string[];
  radiusMeters?: number;
  limit?: number;
}

const DEFAULT_RADIUS_M = 10_000;
const DEFAULT_LIMIT = 5;

const haversineMeters = (a: ShopLocation, b: ShopLocation): number => {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const mockShops = (origin: ShopLocation, limit: number): Shop[] => {
  const samples: Array<Omit<Shop, 'distanceMeters' | 'mapsUrl'>> = [
    {
      name: 'Greenfield Agro Supplies',
      address: '12 Market Rd',
      location: { lat: origin.lat + 0.01, lng: origin.lng + 0.008 },
      rating: 4.5,
    },
    {
      name: 'Farmers Choice Agrochemicals',
      address: '45 Industrial Ave',
      location: { lat: origin.lat - 0.012, lng: origin.lng + 0.004 },
      rating: 4.2,
    },
    {
      name: 'AgriCare Centre',
      address: '8 Harvest Lane',
      location: { lat: origin.lat + 0.006, lng: origin.lng - 0.011 },
      rating: 4.7,
    },
  ];
  return samples.slice(0, limit).map((s) => ({
    ...s,
    distanceMeters: Math.round(haversineMeters(origin, s.location)),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.address)}`,
  }));
};

interface GooglePlacesResult {
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  place_id: string;
}

interface GooglePlacesResponse {
  status: string;
  results: GooglePlacesResult[];
  error_message?: string;
}

const fetchFromGoogle = async (
  params: FindShopsParams,
  apiKey: string,
): Promise<Shop[]> => {
  const radius = params.radiusMeters ?? DEFAULT_RADIUS_M;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const keyword =
    params.productKeywords.length > 0
      ? params.productKeywords[0]
      : 'agrochemical';

  // Text Search supports keyword + location bias; gives richer results than Nearby Search for product names.
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', `${keyword} shop`);
  url.searchParams.set('location', `${params.location.lat},${params.location.lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Places HTTP ${res.status}`);
  }
  const data = (await res.json()) as GooglePlacesResponse;
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places error: ${data.status} ${data.error_message ?? ''}`);
  }

  return data.results.slice(0, limit).map((r) => {
    const location = { lat: r.geometry.location.lat, lng: r.geometry.location.lng };
    return {
      name: r.name,
      address: r.formatted_address ?? r.vicinity ?? '',
      location,
      distanceMeters: Math.round(haversineMeters(params.location, location)),
      rating: r.rating,
      mapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
    };
  });
};

export const findNearbyShops = async (params: FindShopsParams): Promise<Shop[]> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey && params.productKeywords.length > 0) {
    try {
      return await fetchFromGoogle(params, apiKey);
    } catch (err) {
      console.warn('[shops] Google Places lookup failed, falling back to mock:', err);
    }
  }
  return mockShops(params.location, params.limit ?? DEFAULT_LIMIT);
};
