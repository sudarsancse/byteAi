import { getModel } from "../Config/LLMmodel.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  if (state.file) {
    if (state.file.mimetype === "application/pdf") {
      return {
        ...state,
        agent: "pdfRag",
      };
    }

    if (state.file.mimetype.startsWith("image/")) {
      return {
        ...state,
        agent: "imageAnalyzer",
      };
    }
  }

  const llm = await getModel("router");
  const prompt = `You are an intent router for a multi-agent system. Read the user's message and output ONLY one word: the name of the most appropriate agent. No punctuation, no explanation, no JSON — just the word.

Available agents (output must be exactly one of these):
chat
search
coding
pdf
ppt
imageGen

## Routing Rules

chat — Default agent. Use for:
- General conversation, greetings, small talk
- Explanations of concepts, definitions, how things work
- Advice, brainstorming, opinions, ideas
- Any question answerable from general knowledge, with no live data or file/document output needed

search — Use when the request needs real-time or post-cutoff information:
- Current events, news, "latest", "recent", "today", "this week"
- Prices, scores, weather, stock data
- Looking up a real-world entity's current status (e.g. "who is the CEO of X now")

coding — Use for:
- Writing, debugging, reviewing, or explaining code
- Building/scaffolding a project or feature
- System/API/architecture design
- Any request referencing a programming language, framework, stack trace, or code file

pdf — Use when the request explicitly involves a PDF file:
- Creating a PDF from content
- Extracting, summarizing, or answering questions about an uploaded PDF
- Filling, merging, splitting, or editing PDF files

ppt — Use when the request explicitly involves a presentation/slide deck:
- Creating a pitch deck, slide deck, or presentation
- Editing, reading, or restructuring an existing .pptx file

imageGen — Use when the request involves generating or editing a visual image:
- "Generate an image of...", "create a picture/illustration/logo of..."
- Editing, style-transferring, or upscaling an existing image

## Priority (apply in order when multiple could match)

1. If a specific file type is named or uploaded (.pdf, .pptx, code file, image file) → route to the matching agent.
2. If the request asks to create a downloadable artifact (document, deck, image) → route to that artifact's agent, even if it also needs research (e.g. "make a PDF report on today's AI news" → pdf, not search).
3. If it needs current/live facts with no file/code/image deliverable → search.
4. If nothing matches clearly → chat.

## Output Rules
- Output must be exactly one word, lowercase, from the list above.
- Do not add quotes, periods, markdown, or any other text.
- Do not explain your reasoning.

## Examples

User: "What's the weather in Kolkata right now?"
search

User: "Fix this null pointer exception in my React component"
coding

User: "Turn my quarterly sales data into a slide deck"
ppt

User: "Summarize the attached PDF and tell me the key risks"
pdf

User: "Make me a logo for a coffee shop called Bean There"
imageGen

User: "What's the difference between REST and GraphQL?"
chat


${state.prompt}`;

  const res = await llm.invoke(prompt);

  return {
    ...state,
    agent: res.content.trim().toLowerCase(),
  };
};
