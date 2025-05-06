import { Request, Response } from "express";
import { jobInputSchema } from "../types/schema";
import { startSearchJob } from "../services/job.service";
import { getJobStatus } from "../repository/search.repository";
import { getAllJobs } from "../repository/search.repository";

// Create a new search job
export async function searchJob(req: Request, res: Response) {
  try {
    const body = req.body;

    const validationResult = jobInputSchema.safeParse(body);
    if (!validationResult.success) {
      res.status(400).json({ error: validationResult.error.errors });
      return;
    }

    const job = await startSearchJob(validationResult.data);

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: "Job started successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get job status
export async function getJob(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({ message: "Job ID is required" });
      return;
    }

    const job = await getJobStatus(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.status(200).json({
      id: job.id,
      status: job.status,
      searchedName: job.searchedName,
      location: job.location,
      profilesScraped: job.Profile.length,
      results:
        job.status === "COMPLETED" ? JSON.parse(job.results as string) : null,
      error: job.error,
      createdAt: job.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all jobs (history)
export async function getJobs(req: Request, res: Response) {
  try {
    const jobs = await getAllJobs();
    res.status(200).json(
      jobs.map((job) => ({
        id: job.id,
        searchedName: job.searchedName,
        location: job.location,
        status: job.status,
        createdAt: job.createdAt,
        // resultCount: job.resultIds.length,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
