import { Injectable } from "@nestjs/common";
import type { Prisma, PrismaClient, Match as PrismaMatch, Student as PrismaStudent } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

type PrismaLikeClient = PrismaClient | Prisma.TransactionClient;

type MatchSeedInput = {
  studentId: string;
  score: number;
  reason: string;
};

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async createManyForGig(
    client: PrismaLikeClient,
    gigId: string,
    matches: MatchSeedInput[],
  ): Promise<void> {
    if (!matches.length) {
      return;
    }

    await client.match.createMany({
      data: matches.map((match) => ({
        gigId,
        studentId: match.studentId,
        score: match.score,
        reason: match.reason,
      })),
    });
  }

  findByGigId(
    client: PrismaLikeClient = this.prisma,
    gigId: string,
  ): Promise<Array<PrismaMatch & { student: PrismaStudent }>> {
    return client.match.findMany({
      where: { gigId },
      include: {
        student: true,
      },
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    });
  }
}
