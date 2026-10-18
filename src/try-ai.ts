import "dotenv/config";
import { reviewProject } from "./ai/gemini.js";

const samplePrompt =
  "A campus web app where students can report lost items, search found items, and securely contact the person who posted a matching report.";

try {
  const review = await reviewProject(samplePrompt);
  console.log(JSON.stringify(review, null, 2));
} catch (error) {
  console.error("AI review failed:", error);
  process.exitCode = 1;
}