import { z } from "zod";

export const aiRequestSchema = z.object({
  prompt: z
    .string({ error: "Prompt must be a string" })
    .trim()
    .min(20, { error: "Prompt must be at least 20 characters long" })
    .max(2000, { error: "Prompt must be no more than 2000 characters long" }),
});

export const reviewSchema = z.object({
  summary: z.string().describe("A concise summary of the student's project description."),
  strengths: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("One to three specific strengths in the project description."),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("One to three actionable improvements for the project description."),
  readiness: z
    .enum(["ready", "almost", "not-yet"])
    .describe("Whether the project description is ready, almost ready, or not yet ready."),
});

export type Review = z.infer<typeof reviewSchema>;

export const reviewJsonSchema = z.toJSONSchema(reviewSchema);