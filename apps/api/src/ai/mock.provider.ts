import { Injectable, Logger } from "@nestjs/common";
import type { LlmProvider } from "./llm-provider.interface.js";

const JUSTIFICATIONS = {
  high: "Strong alignment between their skills and the job requirements.",
  mid: "Partial overlap with the role's core needs.",
  low: "Limited relevant experience for this particular task.",
  mismatch: "No significant overlap between this student's background and the technical requirements.",
} as const;

const TECHNICAL_KEYWORDS = [
  "machine learning", "algorithm", "data pipeline", "kubernetes",
  "docker", "api", "programming", "software", "deploy", "code",
  "neural network", "database", "backend", "frontend", "devops",
  "cloud", "infrastructure", "terraform", "microservices", "graphql",
];

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

    const isTechnical = this.isHighlyTechnical(prompt);
    const scores = this.generateScores(studentIds.length, isTechnical);

    const matches = studentIds.map((id, i) => {
      const score = scores[i]!;
      let reason: string;
      if (isTechnical) {
        reason = JUSTIFICATIONS.mismatch;
      } else if (i === 0) {
        reason = JUSTIFICATIONS.high;
      } else if (score >= 50) {
        reason = JUSTIFICATIONS.mid;
      } else {
        reason = JUSTIFICATIONS.low;
      }
      return { studentId: id, score, reason };
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

  private generateScores(count: number, isTechnical: boolean): number[] {
    if (isTechnical) {
      this.logger.log("MockLlmProvider: highly technical job detected — generating low scores for all students");
      return Array.from({ length: count }, () => this.randInt(8, 28));
    }

    const tiedScore = this.randInt(82, 95);
    const scores: number[] = [tiedScore, tiedScore];

    for (let i = 2; i < count; i++) {
      if (i < 4) {
        scores.push(this.randInt(45, 75));
      } else {
        scores.push(this.randInt(20, 40));
      }
    }

    return scores;
  }

  private isHighlyTechnical(prompt: string): boolean {
    const lower = prompt.toLowerCase();
    const matches = TECHNICAL_KEYWORDS.filter((kw) => lower.includes(kw));
    const result = matches.length >= 2;
    if (result) {
      this.logger.log(`MockLlmProvider: detected technical keywords: ${matches.join(", ")}`);
    }
    return result;
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
