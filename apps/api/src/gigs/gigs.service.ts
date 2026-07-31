import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  Gig as PrismaGig,
  Match as PrismaMatch,
  Prisma,
  PrismaClient,
  Student as PrismaStudent,
  User as PrismaUser,
} from "@prisma/client";
import { AssignGigDto } from "../dto/assign-gig.dto.js";
import { CreateGigDto } from "../dto/create-gig.dto.js";
import { AiMatchingService } from "../ai/ai-matching.service.js";
import { MatchesService } from "../matches/matches.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { StudentsService } from "../students/students.service.js";
import type { GigCandidate, GigResponse, GigStatus } from "./gig.types.js";

type PrismaLikeClient = PrismaClient | Prisma.TransactionClient;

type GigWithRelations = PrismaGig & {
  matches: (PrismaMatch & {
    student: PrismaStudent;
  })[];
  assignedStudent: PrismaStudent | null;
  createdBy: PrismaUser;
};

@Injectable()
export class GigsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(StudentsService) private readonly studentsService: StudentsService,
    @Inject(MatchesService) private readonly matchesService: MatchesService,
    @Inject(AiMatchingService)
    private readonly aiMatchingService: AiMatchingService,
  ) {}

  async createGig(createGigDto: CreateGigDto, createdById: string): Promise<GigResponse> {
    const gig = await this.prisma.gig.create({
      data: {
        title: createGigDto.title,
        description: createGigDto.description,
        location: createGigDto.location,
        durationHours: createGigDto.durationHours,
        hourlyRate: createGigDto.hourlyRate,
        skills: createGigDto.skills ?? [],
        schedule: createGigDto.schedule ?? null,
        contact: createGigDto.contact ?? null,
        status: "OPEN",
        createdById,
      },
    });

    const students = await this.studentsService.findAll();
    const scoredCandidates: GigCandidate[] =
      await this.aiMatchingService.findMatches(createGigDto, students);

    await this.matchesService.createManyForGig(
      this.prisma,
      gig.id,
      scoredCandidates.map((candidate) => ({
        studentId: candidate.student.id,
        score: candidate.matchPercent,
        reason: candidate.justification,
      })),
    );

    const persistedGig = await this.loadGigWithRelations(this.prisma, gig.id);
    return this.toGigResponse(persistedGig);
  }

  async getGig(id: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    return this.toGigResponse(gig);
  }

  async listGigs(userId: string, role: string): Promise<GigResponse[]> {
    let gigs: GigWithRelations[];

    if (role === "MANAGER") {
      gigs = await this.prisma.gig.findMany({
        where: { createdById: userId },
        include: {
          matches: { include: { student: true }, orderBy: [{ score: "desc" }, { createdAt: "asc" }] },
          assignedStudent: true,
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.studentId) return [];

      gigs = await this.prisma.gig.findMany({
        where: { assignedStudentId: user.studentId },
        include: {
          matches: { include: { student: true }, orderBy: [{ score: "desc" }, { createdAt: "asc" }] },
          assignedStudent: true,
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return gigs.map((gig) => this.toGigResponse(gig));
  }

  async assignGig(
    id: string,
    assignGigDto: AssignGigDto,
    userId: string,
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

      if (gig.createdById !== userId) {
        throw new ForbiddenException("You do not own this gig");
      }

      if (gig.status !== "OPEN") {
        throw new BadRequestException("Only open gigs can be assigned");
      }

      await transaction.gig.update({
        where: { id },
        data: {
          status: "ASSIGNED",
          assignedStudentId: assignGigDto.studentId,
          completedAt: null,
        },
      });

      const updatedGig = await this.loadGigWithRelations(transaction, id);
      return {
        ...this.toGigResponse(updatedGig),
        selectedCandidate: this.toCandidate(candidate),
      };
    });
  }

  async acceptGig(id: string, studentId: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    this.assertAssignedStudent(gig, studentId);
    if (gig.status !== "ASSIGNED") {
      throw new BadRequestException("Only assigned gigs can be accepted");
    }

    const updated = await this.prisma.gig.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });
    return this.toGigResponse({ ...gig, ...updated });
  }

  async declineGig(id: string, studentId: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    this.assertAssignedStudent(gig, studentId);
    if (gig.status !== "ASSIGNED") {
      throw new BadRequestException("Only assigned gigs can be declined");
    }

    const updated = await this.prisma.gig.update({
      where: { id },
      data: {
        status: "OPEN",
        assignedStudentId: null,
        completedAt: null,
      },
    });
    return this.toGigResponse({ ...gig, ...updated });
  }

  async completeGig(id: string, studentId: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    this.assertAssignedStudent(gig, studentId);
    if (gig.status !== "IN_PROGRESS") {
      throw new BadRequestException("Only in-progress gigs can be marked complete");
    }

    const updated = await this.prisma.gig.update({
      where: { id },
      data: { status: "PENDING_COMPLETION" },
    });
    return this.toGigResponse({ ...gig, ...updated });
  }

  async confirmGigCompletion(id: string, userId: string): Promise<GigResponse> {
    const gig = await this.loadGigWithRelations(this.prisma, id);
    if (gig.createdById !== userId) {
      throw new ForbiddenException("You do not own this gig");
    }
    if (gig.status !== "PENDING_COMPLETION") {
      throw new BadRequestException("Only gigs pending confirmation can be confirmed");
    }

    const updated = await this.prisma.gig.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    return this.toGigResponse({ ...gig, ...updated });
  }

  private assertAssignedStudent(
    gig: GigWithRelations,
    studentId: string,
  ): void {
    if (gig.assignedStudentId !== studentId) {
      throw new ForbiddenException("Gig is not assigned to this student");
    }
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
        createdBy: true,
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
      ...(gig.completedAt != null ? { completedAt: gig.completedAt.toISOString() } : {}),
      status: this.mapGigStatus(gig.status),
      gig: {
        title: gig.title,
        description: gig.description,
        location: gig.location,
        durationHours: gig.durationHours,
        hourlyRate: gig.hourlyRate,
        skills: gig.skills,
        ...(gig.schedule != null ? { schedule: gig.schedule } : {}),
        ...(gig.contact != null ? { contact: gig.contact } : {}),
      },
      candidates: gig.matches.map((match) => this.toCandidate(match)),
      assignedStudentId: gig.assignedStudentId,
      manager: {
        name: gig.createdBy.email.split("@")[0] ?? "Manager",
        email: gig.createdBy.email,
      },
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
    switch (status) {
      case "OPEN":
        return "Open";
      case "ASSIGNED":
        return "Assigned";
      case "IN_PROGRESS":
        return "InProgress";
      case "PENDING_COMPLETION":
        return "PendingConfirmation";
      case "COMPLETED":
        return "Completed";
    }
  }
}
