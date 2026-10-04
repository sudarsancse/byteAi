import axios from "axios";
import { getModel } from "../Config/LLMmodel.js";
import { uploadToS3 } from "../utils/uploade-To-S3.js";
import { getFromS3 } from "../utils/get-From-s3.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";
import { checkLimit } from "../Config/agentLimit.js";

export const imageGenAgent = async (state) => {
  try {
    await checkLimit(state.userId, "image");
    const llm = await getModel("imagegen");

    const res = await llm.invoke(`
You are an elite AI image prompt engineer. Your job is to convert a short, casual user request into a single, highly detailed image generation prompt suitable for models like Midjourney, DALL-E, or Stable Diffusion.

User request:
"${state.prompt}"

Requirements for the final prompt:
- Cinematic lighting (specify type: e.g. golden hour, rim lighting, volumetric fog, softbox, neon glow — pick what fits the scene)
- Professional composition (specify framing: e.g. rule of thirds, low-angle shot, close-up, wide establishing shot, depth of field)
- Ultra realistic (mention camera/lens details where relevant: e.g. shot on 85mm lens, f/1.8, shallow depth of field, photorealistic textures)
- 8K quality (ultra high resolution, extreme fine detail, crisp sharp textures)
- Stunning visuals (striking colors, dramatic contrast, visually captivating and awe-inspiring overall impression)
- Include subject, setting/environment, mood/atmosphere, color palette, and level of detail
- Keep it as ONE continuous descriptive paragraph (no bullet points, no headers)
- Do not include any commentary, explanation, or preamble — output ONLY the final image prompt

Now generate the final image prompt based on the user request above.
`);

    const prompt = res.content.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(imageRes.data);

    const filename = `image-${Date.now()}.png`;

    //UPLOAD IMAGE DATA TO AWS S3
    await uploadToS3(filename, buffer, "image/png");

    // GET IMAGE URL FROM AWS S3
    const dowenloadUrl = await getFromS3(filename, 60 * 10);
    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "image");
    return {
      ...state,
      aiResponse: `
     🖼️ Image Generated Successfully

![Generated Image](${dowenloadUrl})

📥  [Download Image](${dowenloadUrl})

⏳ Link expires in with 10 min.
    `,
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to generate image.",
    };
  }
};
