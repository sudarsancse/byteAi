import { checkLimit } from "../Config/agentLimit.js";
import { getModel } from "../Config/LLMmodel.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";
import { generatePPT } from "../utils/generate-PPT.js";
import { getFromS3 } from "../utils/get-From-s3.js";
import { uploadToS3 } from "../utils/uploade-To-S3.js";

export const pptAgent = async (state) => {
  try {
    await checkLimit(state.userId, "ppt");
    const llm = await getModel("ppt");

    const prompt = `
You are an expert presentation designer. Your job is to convert a user's topic/request into a complete, well-structured PowerPoint presentation outline in strict JSON format.

User request:
"${state.prompt}"

Output requirements:
- Return ONLY valid JSON. Do NOT return markdown, code fences, explanations, or any commentary — output the raw JSON object and nothing else.
- The JSON must strictly follow this schema:

{
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": ["", "", ""]
    }
  ]
}

- Generate between 6 and 10 slides total (adjust based on how much the topic naturally supports — do not pad with filler).
- The first slide should introduce the topic and its "points" array should contain 1 to 2 short framing points (not empty, since there is no separate title-slide layout in this schema).
- The last slide should summarize key takeaways or a conclusion.
- Each slide's "points" array must contain 3 to 5 concise bullet points, except the first slide (see above). Each point should be short enough to read aloud in a few seconds (max ~12 words) — not a paragraph.
- Each slide's "title" should be a short, punchy slide heading (max ~8 words), not a full sentence.
- Ensure slides flow logically from introduction through to conclusion, covering the topic comprehensively without redundancy.
- Do not repeat titles or points across slides.
- Output must be parseable directly with JSON.parse() — no trailing commas, no comments, no unescaped quotes.

Now generate the JSON structure based on the user request above.
`;

    const res = await llm.invoke(prompt);

    const data = JSON.parse(res.content);
    const pptGenerate = await generatePPT(data);
    const buffer = await pptGenerate.write({
      outputType: "nodebuffer",
    });

    const filename = `PPT-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    const PPTUrl = await getFromS3(filename, 60 * 10);
    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "ppt");
    return {
      ...state,
      aiResponse: `
     PPT Generated Successfully
    
**${data.title}**


📥  [Download PPT](${PPTUrl})

⏳ Link expires in with 10 min.
    `,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: error?.data?.message || `Failed to generate PPT`,
    };
  }
};
