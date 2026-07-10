import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import type { Student as PrismaStudent } from "@prisma/client";
import { CreateGigDto } from "../dto/create-gig.dto.js";
import type { GigCandidate } from "../gigs/gig.types.js";
import { type LlmProvider, LLM_PROVIDER } from "./llm-provider.interface.js";

type LlmMatchResult = {
  studentId: string;
  score: number;
  reason: string;
};

type LlmResponse = {
  matches: LlmMatchResult[];
};

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
  ) {}

  async findMatches(
    gigDto: CreateGigDto,
    students: PrismaStudent[],
  ): Promise<GigCandidate[]> {
    if (!students.length) {
      throw new BadRequestException(
        "No students available for matching. Seed the database first.",
      );
    }

    this.logger.log(
      `Starting AI matching: "${gigDto.title}" against ${students.length} students`,
    );

    const prompt = this.buildPrompt(gigDto, students);
    const rawResponse = await this.llmProvider.generateContent(prompt);
    const parsed = this.parseAndValidate(rawResponse, students);
    const candidates = this.toGigCandidates(parsed, students);

    this.logger.log(
      `AI matching complete: ${candidates.length} candidates scored`,
    );

    return candidates;
  }

  private buildPrompt(
    gigDto: CreateGigDto,
    students: PrismaStudent[],
  ): string {
    const studentProfiles = students
      .map(
        (s) =>
          `- ID: ${s.id}\n  Name: ${s.fullName}\n  Major: ${s.major}\n  Skills: ${s.skills.join(", ")}\n  Interests: ${s.interests.join(", ")}`,
      )
      .join("\n\n");

    return `You are a campus job matching coordinator. Evaluate how well each student matches the given campus micro-job.

## Job Details
- Title: ${gigDto.title}
- Description: ${gigDto.description}
- Location: ${gigDto.location}
- Duration: ${gigDto.durationHours} hours
- Hourly Rate: $${gigDto.hourlyRate}

## Student Candidates
${studentProfiles}

## Instructions
1. Compare the job requirements against each student's profile.
2. Evaluate how well their major, skills, and interests align with the job.
3. Assign a match score between 0 and 100 for each student.
4. Write a concise one-sentence justification for each score.
5. Rank all students from highest score to lowest.
6. Every student in the list MUST receive a score. Do not omit any student.

## Response Format
Return ONLY valid JSON with no markdown fences, no explanation, no extra text.
Use this exact structure:
{
  "matches": [
    {
      "studentId": "the-student-uuid",
      "score": 95,
      "reason": "Excellent match because..."
    }
  ]
}`;
  }

  private parseAndValidate(
    raw: string,
    students: PrismaStudent[],
  ): LlmMatchResult[] {
    let parsed: LlmResponse;

    try {
      parsed = JSON.parse(raw) as LlmResponse;
    } catch {
      this.logger.error(`Failed to parse LLM response as JSON: ${raw.slice(0, 500)}`);
      throw new BadRequestException(
        "AI returned invalid JSON. The matching engine could not process the response.",
      );
    }

    if (!parsed || !Array.isArray(parsed.matches)) {
      this.logger.error(
        `LLM response missing 'matches' array: ${JSON.stringify(parsed).slice(0, 500)}`,
      );
      throw new BadRequestException(
        "AI response missing 'matches' array. Received: " +
          JSON.stringify(Object.keys(parsed ?? {})),
      );
    }

    if (parsed.matches.length === 0) {
      throw new BadRequestException(
        "AI returned an empty matches array. No scores were generated.",
      );
    }

    const validStudentIds = new Set(students.map((s) => s.id));
    const matchedIds = new Set<string>();
    const validated: LlmMatchResult[] = [];

    for (const match of parsed.matches) {
      if (!match.studentId || typeof match.studentId !== "string") {
        this.logger.warn(`Skipping match with invalid studentId: ${JSON.stringify(match)}`);
        continue;
      }

      if (!validStudentIds.has(match.studentId)) {
        this.logger.warn(
          `Skipping match for unknown studentId: ${match.studentId}`,
        );
        continue;
      }

      if (matchedIds.has(match.studentId)) {
        this.logger.warn(
          `Duplicate studentId in LLM response: ${match.studentId}, keeping first occurrence`,
        );
        continue;
      }

      const score = typeof match.score === "number"
        ? Math.max(0, Math.min(100, Math.round(match.score)))
        : 0;

      const reason =
        typeof match.reason === "string" && match.reason.length > 0
          ? match.reason
          : "No justification provided by AI.";

      validated.push({
        studentId: match.studentId,
        score,
        reason,
      });

      matchedIds.add(match.studentId);
    }

    for (const student of students) {
      if (!matchedIds.has(student.id)) {
        this.logger.warn(
          `Student ${student.fullName} (${student.id}) was omitted by LLM, assigning score 0`,
        );
        validated.push({
          studentId: student.id,
          score: 0,
          reason: "No match data available from AI evaluation.",
        });
      }
    }

    validated.sort((a, b) => b.score - a.score);

    return validated;
  }

  private toGigCandidates(
    matches: LlmMatchResult[],
    students: PrismaStudent[],
  ): GigCandidate[] {
    const studentMap = new Map(students.map((s) => [s.id, s]));

    return matches.map((match) => {
      const student = studentMap.get(match.studentId)!;
      return {
        student: {
          id: student.id,
          name: student.fullName,
          major: student.major,
          skills: student.skills,
          interests: student.interests,
        },
        matchPercent: match.score,
        justification: match.reason,
      };
    });
  }
}
