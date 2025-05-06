import { JobInput } from "../types/schema";
import {
  createSearchJob,
  updateJobStatus,
  updateJobResults,
} from "../repository/search.repository";
import { getTinderMatches, changeTinderLocation } from "./tinder";
import { getEmbedding } from "./embedding";
import {
  checkLocationIndexed,
  fuzzySearch,
  getCoordinates,
} from "../lib/utils";
import { getAllProfilesByLocation } from "../repository/profile.repository";
import { searchInPinecone } from "./pinecone";
import { createLocationEntry } from "../repository/location.repository";

export async function startSearchJob(input: JobInput) {
  const job = await createSearchJob(input);

  // start processing in background
  processJobAsync(job.id, input);

  return job;
}

async function processJobAsync(jobId: string, input: JobInput) {
  try {
    // Update status to processing
    await updateJobStatus(jobId, "PROCESSING");

    const { lat, lon } = await getCoordinates(input.location);

    const indexedLocationId = await checkLocationIndexed(lat, lon);
    let locationId = indexedLocationId;

    if (!locationId) {
      // If location is not indexed, change Tinder location and fetch matches
      const changeLoc = await changeTinderLocation(lat, lon);

      if (changeLoc?.status !== 200) {
        throw new Error("Failed to change Tinder location");
      }

      const newLocationId = await createLocationEntry({
        lat,
        lon,
        name: input.location,
      });
      locationId = newLocationId;

      const matches = await getTinderMatches(locationId, jobId);

      if (!matches) {
        throw new Error("Failed to fetch Tinder matches");
      }
    }

    // Run the search processes
    const profiles = await getAllProfilesByLocation(locationId);
    const nameMatches = await fuzzySearch(profiles, input.name);

    let imageMatches = [];
    const inputImgEmbedding = await getEmbedding(input.photos![0]);
    imageMatches = await searchInPinecone(inputImgEmbedding, locationId);

    // Update job with results
    await updateJobResults(jobId, {
      nameMatches,
      imageMatches,
    });
  } catch (error) {
    // Update job with error if literally any error occurs
    await updateJobStatus(
      jobId,
      "FAILED",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
