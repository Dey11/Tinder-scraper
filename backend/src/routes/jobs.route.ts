import { Router } from "express";
import { searchJob, getJob, getJobs } from "../controllers/job.controller";

export const router = Router();

router.post("/search", searchJob);

router.get("/:jobId", getJob);

router.get("/", getJobs);
