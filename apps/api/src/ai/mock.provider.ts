import { Injectable, Logger } from "@nestjs/common";
import type { LlmProvider } from "./llm-provider.interface.js";

const JUSTIFICATIONS: Record<string, string> = {
  high: "Strong alignment between their skills and the job requirements.",
  mid: "Partial overlap with the role's core needs.",
  low: "Limited relevant experience for this particular task.",
};

@Injectable()
export class MockLlmProvider implements LlmProvider {
  readonly name = "mock";
  private readonly logger = new Logger(MockLlmProvider.name);

  async generateContent(prompt: string): Promise<string> {
    this.logger.log(`MockLlmProvider: generating simulated response (~${prompt.length} chars)`);

    const studentIds = this.extractStudentIds(prompt);

    if (!studentIds.length) {
      this.logger.warn("MockLlmProvider: no student IDs found in prompt, returning empty matches");
      return JSON.stringify({ matches: [] });
    }

    const scores = this.generateScores(studentIds.length);
    const matches = studentIds.map((id, i) => {
      const score = scores[i]!;
      return {
        studentId: id,
        score,
        reason: i === 0 ? JUSTIFICATIONS.high : score >= 50 ? JUSTIFICATIONS.mid : JUSTIFICATIONS.low,
      };
    });

    const response = JSON.stringify({ matches });
    this.logger.log(`MockLlmProvider: returning ${matches.length} mock matches`);

    return response;
  }

  private extractStudentIds(prompt: string): string[] {
    const uuidRegex = /ID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
    const ids: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = uuidRegex.exec(prompt)) !== null) {
      ids.push(match[1]!);
    }

    return ids;
  }

  private generateScores(count: number): number[] {
    const scores: number[] = [];

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        scores.push(this.randInt(82, 95));
      } else if (i < 3) {
        scores.push(this.randInt(50, 80));
      } else {
        scores.push(this.randInt(20, 55));
      }
    }

    return scores.sort((a, b) => b - a);
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
