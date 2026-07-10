import { Module } from "@nestjs/common";
import { AiMatchingService } from "./ai-matching.service.js";
import { GroqProvider } from "./groq.provider.js";
import { LLM_PROVIDER } from "./llm-provider.interface.js";

@Module({
  providers: [
    AiMatchingService,
    {
      provide: LLM_PROVIDER,
      useClass: GroqProvider,
    },
  ],
  exports: [AiMatchingService],
})
export class AiModule {}
