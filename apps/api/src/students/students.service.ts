import { Injectable } from "@nestjs/common";
import type { Prisma, PrismaClient, Student as PrismaStudent } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

type PrismaLikeClient = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(client: PrismaLikeClient = this.prisma): Promise<PrismaStudent[]> {
    return client.student.findMany({
      orderBy: [{ major: "asc" }, { fullName: "asc" }],
    });
  }

  findById(studentId: string, client: PrismaLikeClient = this.prisma): Promise<PrismaStudent | null> {
    return client.student.findUnique({
      where: { id: studentId },
    });
  }
}
