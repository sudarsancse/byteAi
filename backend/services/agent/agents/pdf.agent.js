import { checkLimit } from "../Config/agentLimit.js";
import { getModel } from "../Config/LLMmodel.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";
import { generatePDF } from "../utils/generate-Pdf.js";
import { getFromS3 } from "../utils/get-From-s3.js";
import { uploadToS3 } from "../utils/uploade-To-S3.js";

export const pdfAgent = async (state) => {
  try {
    await checkLimit(state.userId, "pdf");
    const llm = await getModel("pdf");

    const prompt = `
You are an expert document structure generator. Your job is to convert a user's topic/request into a complete, well-organized PDF document structure in strict JSON format.

User request:
"${state.prompt}"

Output requirements:
- Return ONLY valid JSON. Do NOT return markdown, code fences, explanations, or any commentary — output the raw JSON object and nothing else.
- The JSON must strictly follow this schema:

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

- Generate exactly at least 8 sections inside the "sections" array.
- Each section must have a unique, relevant "heading" (a short descriptive title for that section).
- Each section's "points" array should contain 3 to 6 concise bullet points relevant to that heading, covering the topic in depth.
- The "title" should be a compelling, relevant title for the overall document based on the user request.
- The "subtitle" should be a one-line supporting description of the document's purpose or scope.
- Ensure the 48 sections logically flow and comprehensively cover the topic from introduction to conclusion.
- Do not repeat headings or points across sections.
- Output must be parseable directly with JSON.parse() — no trailing commas, no comments, no unescaped quotes.

Now generate the JSON structure based on the user request above.
`;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);

    const pdfBuffer = await generatePDF(data);

    const filename = `PDF-${Date.now()}.pdf`;

    await uploadToS3(filename, pdfBuffer, "application/pdf");

    const PdfUrl = await getFromS3(filename, 60 * 10);
    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "pdf");
    return {
      ...state,
      aiResponse: `
     PDF Generated Successfully
    
**${data.title}**


📥  [Download PDF](${PdfUrl})

⏳ Link expires in with 10 min.
    `,
    };

    // // 1. Normalize content — could be a string or an array of content blocks
    // const raw = Array.isArray(res.content)
    //   ? res.content
    //       .map((c) => c.text ?? "")
    //       .join("")
    //       .trim()
    //   : String(res.content).trim();

    // // 2. Defensively strip markdown code fences, in case the model adds them anyway
    // const clean = raw.replace(/^```json\s*|^```\s*|```$/g, "").trim();
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse:
        error?.data?.message ||
        `
    Failed to Generated PDF.
    `,
    };
  }
};
