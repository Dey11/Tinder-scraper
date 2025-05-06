import { FuseResult } from "fuse.js";
import { prisma } from "../lib/prisma";
import { ProfileBasic } from "../types";
import { JobInput } from "../types/schema";
import {
  RecordMetadata,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";

export async function createSearchJob(input: JobInput) {
  return prisma.searchLog.create({
    data: {
      searchedName: input.name,
      searchedImage: input.photos![0],
      status: "PENDING",
      results: JSON.stringify({}),
      location: input.location,
    },
  });
}

export async function getJobStatus(jobId: string) {
  return prisma.searchLog.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      searchedName: true,
      location: true,
      status: true,
      results: true,
      error: true,
      createdAt: true,
      Profile: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function updateJobStatus(
  jobId: string,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
  error?: string
) {
  return prisma.searchLog.update({
    where: { id: jobId },
    data: { status, error },
  });
}

export async function updateJobResults(
  jobId: string,
  res: {
    nameMatches: FuseResult<ProfileBasic>[];
    imageMatches: ScoredPineconeRecord<RecordMetadata>[];
  }
) {
  return prisma.searchLog.update({
    where: { id: jobId },
    data: {
      results: JSON.stringify({
        nameMatches: res.nameMatches,
        imageMatches: res.imageMatches,
      }),
      status: "COMPLETED",
    },
  });
}

export async function getAllJobs() {
  return prisma.searchLog.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      location: true,
      searchedName: true,
      status: true,
      createdAt: true,
      results: true,
    },
  });
}
