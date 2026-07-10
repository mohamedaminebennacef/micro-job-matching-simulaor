import { Injectable, Logger } from "@nestjs/common";
import type { LlmProvider } from "./llm-provider.interface.js";

@Injectable()
export class GroqProvider implements LlmProvider {
  readonly name = "groq";
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  private readonly model = "llama-3.3-70b-versatile";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? "";
    if (!this.apiKey) {
      throw new Error(
        "GROQ_API_KEY environment variable is not set. " +
          "Sign up at https://console.groq.com and add it to apps/api/.env",
      );
    }
  }

  async generateContent(prompt: string): Promise<string> {
    this.logger.log(
      `Sending prompt to ${this.name} (${this.model}), ~${prompt.length} chars`,
    );

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Groq API error ${response.status}: ${body}`);
      throw new Error(
        `Groq API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    return content;
  }
}
