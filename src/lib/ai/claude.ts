import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022";
export const MAX_TOKENS = 8192;

export interface GenerateOptions {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateWithClaude(options: GenerateOptions): Promise<string> {
  const { system, prompt, maxTokens = MAX_TOKENS } = options;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: system ?? "You are an elite AI assistant for a web design and AI automation agency.",
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected content type from Claude");
  return content.text;
}

export { anthropic };
