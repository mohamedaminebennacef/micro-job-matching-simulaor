import { Injectable } from "@nestjs/common";
import { CreateGigDto } from "../dto/create-gig.dto.js";
import type { GigCandidate, StudentScoringInput } from "../gigs/gig.types.js";

@Injectable()
export class MatchScoringService {
  scoreCandidate(
    createGigDto: CreateGigDto,
    student: StudentScoringInput,
  ): GigCandidate {
    const jobText =
      `${createGigDto.title} ${createGigDto.description} ${createGigDto.location}`.toLowerCase();
    const studentText = [student.major, ...student.skills, ...student.interests]
      .join(" ")
      .toLowerCase();
    const tokens = [
      "archive",
      "library",
      "flyer",
      "lab",
      "equipment",
      "organize",
      "detail",
      "distribution",
      "moving",
    ];

    let score = 20;

    for (const token of tokens) {
      if (jobText.includes(token) && studentText.includes(token)) {
        score += 16;
      }
    }

    if (
      jobText.includes("archive") &&
      student.major.toLowerCase().includes("history")
    ) {
      score += 28;
    }

    if (
      jobText.includes("flyer") &&
      student.skills.some((skill) => skill.toLowerCase().includes("layout"))
    ) {
      score += 24;
    }

    if (
      jobText.includes("lab") &&
      student.skills.some((skill) => skill.toLowerCase().includes("detail"))
    ) {
      score += 22;
    }

    if (
      jobText.includes("move") &&
      student.skills.some((skill) => skill.toLowerCase().includes("logistics"))
    ) {
      score += 18;
    }

    score = Math.max(5, Math.min(score, 99));

    const reason = this.buildJustification(createGigDto, student);

    return {
      student: {
        id: student.id,
        name: student.fullName,
        major: student.major,
        skills: student.skills,
        interests: student.interests,
      },
      matchPercent: score,
      justification: reason,
    };
  }

  private buildJustification(
    createGigDto: CreateGigDto,
    student: StudentScoringInput,
  ) {
    const headline = createGigDto.title.toLowerCase();

    if (headline.includes("archive") && student.major === "History") {
      return "Strong archival background and a history major make this a natural fit.";
    }

    if (headline.includes("flyer")) {
      return "This student brings visual communication skills that align with flyer distribution work.";
    }

    if (headline.includes("lab")) {
      return "Their attention to detail and lab support experience match the task well.";
    }

    return "Their profile shows the best overlap between the job requirements and listed skills.";
  }
}
