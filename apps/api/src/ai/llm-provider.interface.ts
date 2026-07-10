export const LLM_PROVIDER = "LLM_PROVIDER";

export interface LlmProvider {
  readonly name: string;
  generateContent(prompt: string): Promise<string>;
}
