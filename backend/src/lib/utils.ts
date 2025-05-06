import axios from "axios";
import Fuse, { FuseResult } from "fuse.js";
import { getRecentIndexedLocs } from "../repository/location.repository";
import { GeoLocation, ProfileBasic } from "../types";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCoordinates(
  location: string
): Promise<{ lat: number; lon: number }> {
  try {
    const response = await axios(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        location
      )}&language=en&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
    );
    const data = response.data;
    return {
      lat: data.features[0].geometry.coordinates[1],
      lon: data.features[0].geometry.coordinates[0],
    };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    throw error;
  }
}

export async function checkLocationIndexed(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const recentlyIndexedLocations = await getRecentIndexedLocs();

    if (!recentlyIndexedLocations || recentlyIndexedLocations.length === 0) {
      return null;
    }

    let closestLocation: GeoLocation | null = null;
    let minDistance = Infinity;

    // gets the closest location to the given lat/lon as long as theyre within 100km
    for (const loc of recentlyIndexedLocations) {
      const dist = getDistance(
        { latitude: lat, longitude: lon },
        { latitude: loc.lat, longitude: loc.lon }
      );
      if (dist < 100_000 && dist < minDistance) {
        minDistance = dist;
        closestLocation = loc;
      }
    }

    return closestLocation?.id ?? null;
  } catch (error) {
    console.error("Error checking location indexed:", error);
    throw error;
  }
}

export async function fuzzySearch(
  profiles: ProfileBasic[],
  searchTerm: string
): Promise<FuseResult<ProfileBasic>[]> {
  const options = {
    includeScore: true,
    keys: ["name"],
  };

  const fuse = new Fuse(profiles, options);
  const result = fuse.search(searchTerm);

  return result;
}

function getDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters

  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);

  const aVal =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c; // in meters
}
