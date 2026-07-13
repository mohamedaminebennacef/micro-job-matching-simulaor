import { Module } from "@nestjs/common";
import { AiMatchingService } from "./ai-matching.service.js";
import { GroqProvider } from "./groq.provider.js";
import { MockLlmProvider } from "./mock.provider.js";
import { LLM_PROVIDER } from "./llm-provider.interface.js";

const providerClass =
  process.env.LLM_PROVIDER === "mock" ? MockLlmProvider : GroqProvider;

@Module({
  providers: [
    AiMatchingService,
    {
      provide: LLM_PROVIDER,
      useClass: providerClass,
    },
  ],
  exports: [AiMatchingService],
})
export class AiModule {}
