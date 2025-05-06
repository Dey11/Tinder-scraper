import { prisma } from "../lib/prisma";
import { GeoLocation } from "../types";

export async function createLocationEntry({
  lat,
  lon,
  name,
}: GeoLocation): Promise<string> {
  try {
    const location = await prisma.location.create({
      data: {
        latitude: lat,
        longitude: lon,
        name,
      },
    });
    return location.id;
  } catch (error) {
    console.error("Error creating location entry:", error);
    throw error;
  }
}

export async function getRecentIndexedLocs(): Promise<GeoLocation[]> {
  try {
    const locations = await prisma.location.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    return locations.map((location) => ({
      lat: location.latitude,
      lon: location.longitude,
      name: location.name,
      id: location.id,
    }));
  } catch (error) {
    console.error("Error fetching all locations:", error);
    throw error;
  }
}
