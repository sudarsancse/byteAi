import { checkLimit } from "../Config/agentLimit.js";
import { getModel } from "../Config/LLMmodel.js";
import { dedcutCredits } from "../utils/dedcutCredits.js";

export const codingAgent = async (state) => {
  try {
    await checkLimit(state.userId, "coding");
    const intentLLM = await getModel("intent");
    const llm = await getModel("coding");
    const intentRes = await intentLLM.invoke(
      `You are an intent classifier.

Read the user's message and output ONLY one word: the intent that best matches.
No punctuation, no explanation, no JSON — just the word.

Possible intents:
CODE_GENERATION — user wants code written, created, or scaffolded from scratch
CODE_EXPLANATION — user wants existing code explained or clarified
CODE_DEBUG — user wants help fixing an error, bug, or unexpected behavior
CODE_REVIEW — user wants feedback or improvement suggestions on existing code
CODE_OPTIMIZATION — user wants existing code made faster, cleaner, or more efficient
CODE_CONVERSION — user wants code translated/ported between languages, frameworks, or formats
CODE_DOCUMENTATION — user wants comments, docstrings, or documentation generated for code
GENERAL — anything that doesn't clearly match the above

User Request:
${state.prompt}`,
    );

    const intent = intentRes.content;

    if (intent == "CODE_GENERATION") {
      // const prompt = `
      // You are Byte AI Coding Agent.

      // Generate the requested project based on the user's request below.

      // Default stack:
      // - HTML
      // - CSS
      // - JavaScript

      // Use React / Next.js / Vue ONLY if explicitly requested by the user.

      // Rules:
      // - Responsive design (mobile, tablet, desktop)
      // - Modern, clean UI
      // - CSS variables for colors, spacing, and fonts
      // - Flexbox/Grid for layout, not floats or tables
      // - Smooth scroll behavior where relevant
      // - Hover effects on interactive elements
      // - Beautiful, consistent spacing (avoid cramped or misaligned elements)
      // - Single page unless the user explicitly asks for multiple pages/routes
      // - Code must be complete and functional — no placeholders like "add your code here"

      // Images
      // =====================
      // Use real, working placeholder photos — never gray boxes or broken links.
      // Use https://picsum.photos/{width}/{height} for all images (e.g. https://picsum.photos/400/300).
      // For a consistent/repeatable image in a specific spot, add a seed: https://picsum.photos/seed/{keyword}/{width}/{height}
      // Never use https://via.placeholder.com or any Unsplash URL, since exact Unsplash photo IDs cannot be reliably generated and will result in broken links.

      // Output format:
      // Return ONLY valid JSON. The JSON must follow this exact structure:

      // {
      //   "projectName": "string, short kebab-case name for the project",
      //   "stack": "html-css-js" | "react" | "nextjs" | "vue",
      //   "files": [
      //     {
      //       "filename": "string, e.g. index.html, style.css, script.js",
      //       "language": "string, e.g. html, css, javascript, jsx",
      //       "content": "string, the full file content with \\n for newlines"
      //     }
      //   ],
      //   "description": "string, 1-2 sentence summary of what was built"
      // }

      // Strict output rules:
      // - Output must start with { and end with }
      // - No markdown, no code fences (\\\`\\\`\\\`), no explanations, no preamble, no trailing text
      // - Escape all special characters properly so the JSON is valid and parseable
      // - Do not truncate file content
      // - Include every file needed to run the project (HTML, CSS, JS as separate files unless the user asks for a single file)

      // User Request:
      // ${state.prompt}
      // `;

      //       const prompt = `
      // You are Byte AI Coding Agent.

      // Generate the requested project based on the user's request below.

      // Choosing the stack:
      // - If the user names a language or framework (Python, Node.js, Java, C++, React, Next.js, Vue, etc.), use exactly that.
      // - If the user asks for a website, web page, UI, or app with no stack named, use HTML, CSS and JavaScript.
      // - If the user asks for a script, algorithm, function, or program with no UI mentioned, write plain code in the requested language. Do NOT wrap it in a web page.

      // Web projects only (html-css-js, react, nextjs, vue):
      // - Responsive design, modern clean UI, CSS variables, Flexbox/Grid
      // - Hover effects, consistent spacing, single page unless asked otherwise
      // - Images: use https://picsum.photos/{width}/{height} (optionally /seed/{keyword}/...). Never use via.placeholder.com or Unsplash URLs.

      // Non-web projects (python, node, java, cpp, etc.):
      // - Keep it simple: a single file unless more are needed
      // - Include a main entry point with a short example run
      // - Add brief comments, no UI or styling

      // For all projects:
      // - Code must be complete and runnable, no placeholders

      // Output format:
      // Return ONLY valid JSON with this exact structure:

      // {
      //   "projectName": "short kebab-case name",
      //   "stack": "html-css-js | react | nextjs | vue | python | node | java | cpp | other",
      //   "files": [
      //     {
      //       "filename": "e.g. main.py, index.html",
      //       "language": "e.g. python, html, css, javascript",
      //       "content": "full file content"
      //     }
      //   ],
      //   "description": "1-2 sentence summary"
      // }

      // Strict output rules:
      // - Output must start with { and end with }
      // - No markdown, no code fences, no text outside the JSON
      // - Escape special characters so the JSON is valid
      // - Do not truncate file content

      // User Request:
      // """
      // ${state.prompt}
      // """
      // `;
      const prompt = `
You are Byte AI Coding Agent.

Generate the requested code based on the user's request below.

Choosing the stack:
- If the user names a language or framework (Python, Java, Go, Rust, C++, Node.js, React, Next.js, Vue, etc.), use exactly that.
- If the user asks for a website, web page, UI, or app with no stack named, use HTML, CSS and JavaScript.
- If the user asks for a script, algorithm, function, or program with no UI mentioned, write plain code in the requested language. Do NOT wrap it in a web page.

Web projects only (html-css-js, react, nextjs, vue):
- Responsive design, modern clean UI, CSS variables, Flexbox/Grid
- Hover effects, consistent spacing, single page unless asked otherwise
- For html-css-js use exactly these filenames: index.html, style.css, script.js
- Images: use https://picsum.photos/{width}/{height} (optionally /seed/{keyword}/{width}/{height}). Never use via.placeholder.com or Unsplash URLs.

Non-web projects (python, java, go, rust, cpp, node, etc.):
- Keep it simple: a single file unless more are needed
- Include a main entry point with a short example run
- Add brief comments. Do NOT create any HTML, CSS or UI files.

For all projects:
- Code must be complete and runnable, no placeholders

Output format:
Return ONLY valid JSON with this exact structure:

{
  "projectName": "short kebab-case name",
  "stack": "html-css-js | react | nextjs | vue | python | java | go | rust | cpp | node | other",
  "files": [
    {
      "filename": "e.g. main.py, Main.java, main.go, index.html",
      "language": "e.g. python, java, go, html, css, javascript",
      "content": "full file content"
    }
  ],
  "description": "1-2 sentence summary"
}

Strict output rules:
- Output must start with { and end with }
- No markdown, no code fences, no text outside the JSON
- Escape special characters so the JSON is valid
- Do not truncate file content

User Request:
"""
${state.prompt}
"""
`;
      const res = await llm.invoke(prompt);

      let data;
      try {
        const clean = res.content
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        data = JSON.parse(clean);
      } catch (err) {
        console.error("Failed to parse LLM JSON output:", err, res.content);
        return {
          ...state,
          aiResponse:
            "Sorry, I couldn't generate the project correctly. Please try again.",
          artifacts: [],
        };
      }
      // CREDITS DEDUCTS API CALL
      await dedcutCredits(state.userId, "coding");
      return {
        ...state,
        aiResponse: "Code Generated Successfully",
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state.prompt,
            files: data.files || [],
          },
        ],
      };
    }

    const res = await llm.invoke(`
You are Byte AI Coding Agent.

The user's intent is: ${intent}
The user's request is:

${state.prompt}

Respond in Markdown ONLY. Never generate project files.

Use headings as relevant to the request, such as:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

Only include the headings that are actually relevant to the user's intent and request — do not force unrelated sections.
`);

    const data = res.content;
    // CREDITS DEDUCTS API CALL
    await dedcutCredits(state.userId, "coding");
    return {
      ...state,
      aiResponse: data,
      artifacts: [],
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || "Coddin agent Failed",
      artifacts: [],
    };
  }
};
