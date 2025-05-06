import { z } from "zod";

export const jobInputSchema = z.object({
  name: z.string(),
  location: z.string(),
  photos: z.array(z.string()),
});

export type JobInput = z.infer<typeof jobInputSchema>;
