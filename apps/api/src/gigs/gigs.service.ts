import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  Gig as PrismaGig,
  Match as PrismaMatch,
  Prisma,
  PrismaClient,
  Student as PrismaStudent,
} from "@prisma/client";
import { AssignGigDto } from "../dto/assign-gig.dto.js";
import { CreateGigDto } from "../dto/create-gig.dto.js";
import { MatchesService } from "../matches/matches.service.js";
import { MatchScoringService } from "../matches/match-scoring.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { StudentsService } from "../students/students.service.js";
import type { GigCandidate, GigResponse, GigStatus } from "./gig.types.js";

type PrismaLikeClient = PrismaClient | Prisma.TransactionClient;

type GigWithRelations = PrismaGig & {
  matches: (PrismaMatch & {
    student: PrismaStudent;
  })[];
  assignedStudent: PrismaStudent | null;
};

@Injectable()
export class GigsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsService: StudentsService,
    private readonly matchesService: MatchesService,
    private readonly matchScoringService: MatchScoringService,
  ) {}

  async createGig(createGigDto: CreateGigDto): Promise<GigResponse> {
    return this.prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const gig = await transaction.gig.create({
        data: {
          title: createGigDto.title,
          description: createGigDto.description,
          location: createGigDto.location,
          durationHours: createGigDto.durationHours,
          hourlyRate: createGigDto.hourlyRate,
          status: "OPEN",
        },
      });

      const students = await this.studentsService.findAll(transaction);
      const scoredCandidates: GigCandidate[] = students
        .map((student) => this.matchScoringService.scoreCandidate(createGigDto, student))
        .sort((left, right) => right.matchPercent - left.matchPercent);

      await this.matchesService.createManyForGig(
        transaction,
        gig.id,
        scoredCandidates.map((candidate) => ({
          studentId: candidate.student.id,
          score: candidate.matchPercent,
          reason: candidate.justification,
        })),
      );

      const persistedGig = await this.loadGigWithRelations(transaction, gig.id);
      return this.toGigResponse(persistedGig);
    });
  }

  async getGig(id: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    return this.toGigResponse(gig);
  }

  async assignGig(
    id: string,
    assignGigDto: AssignGigDto,
  ): Promise<GigResponse> {
    return this.prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const gig = await this.loadGigWithRelations(transaction, id);
      const candidate = gig.matches.find(
        (entry) => entry.studentId === assignGigDto.studentId,
      );

      if (!candidate) {
        throw new BadRequestException(
          "Selected student is not part of this matching round",
        );
      }

      await transaction.gig.update({
        where: { id },
        data: {
          status: "ASSIGNED",
          assignedStudentId: assignGigDto.studentId,
        },
      });

      const updatedGig = await this.loadGigWithRelations(transaction, id);
      return {
        ...this.toGigResponse(updatedGig),
        selectedCandidate: this.toCandidate(candidate),
      };
    });
  }

  private async loadGigWithRelations(
    client: PrismaLikeClient,
    id: string,
  ): Promise<GigWithRelations> {
    const gig = await client.gig.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            student: true,
          },
          orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        },
        assignedStudent: true,
      },
    });

    if (!gig) {
      throw new NotFoundException("Gig not found");
    }

    return gig;
  }

  private toGigResponse(gig: GigWithRelations): GigResponse {
    return {
      id: gig.id,
      createdAt: gig.createdAt.toISOString(),
      status: this.mapGigStatus(gig.status),
      gig: {
        title: gig.title,
        description: gig.description,
        location: gig.location,
        durationHours: gig.durationHours,
        hourlyRate: gig.hourlyRate,
      },
      candidates: gig.matches.map((match) => this.toCandidate(match)),
      assignedStudentId: gig.assignedStudentId,
    };
  }

  private toCandidate(match: PrismaMatch & { student: PrismaStudent }): GigCandidate {
    return {
      student: {
        id: match.student.id,
        name: match.student.fullName,
        major: match.student.major,
        skills: match.student.skills,
        interests: match.student.interests,
      },
      matchPercent: match.score,
      justification: match.reason,
    };
  }

  private mapGigStatus(status: PrismaGig["status"]): GigStatus {
    return status === "ASSIGNED" ? "Assigned" : "Open";
  }
}
