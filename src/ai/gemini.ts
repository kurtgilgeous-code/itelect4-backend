import { GoogleGenAI, type Content } from "@google/genai";
import { EXAMPLES, MODEL, SYSTEM_PROMPT, wrap } from "./prompt.js";
import { reviewJsonSchema, reviewSchema, type Review } from "../schemas/review.js";

export class AiReplyError extends Error {}

let client: GoogleGenAI | undefined;

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export function buildContents(description: string): Content[] {
  const examples = EXAMPLES.flatMap(({ description: exampleDescription, review }) => [
    { role: "user", parts: [{ text: wrap(exampleDescription) }] },
    { role: "model", parts: [{ text: JSON.stringify(review) }] },
  ]);

  return [...examples, { role: "user", parts: [{ text: wrap(description) }] }];
}

export async function reviewProject(description: string): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
    },
  });

  if (!response.text) {
    throw new AiReplyError("The AI returned an empty or safety-blocked response");
  }

  let data: unknown;
  try {
    data = JSON.parse(response.text);
  } catch {
    throw new AiReplyError("The AI returned invalid JSON");
  }

  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError(`The AI response did not match the review schema: ${result.error.message}`);
  }

  return result.data;
}