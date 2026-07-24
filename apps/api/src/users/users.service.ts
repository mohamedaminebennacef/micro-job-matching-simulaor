import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role, type User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === Role.MANAGER) {
      throw new ForbiddenException("Managers cannot update student profiles");
    }

    if (!user.studentId) {
      throw new ForbiddenException("No student profile linked to this account");
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id: user.studentId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.major !== undefined && { major: dto.major }),
        ...(dto.graduationYear !== undefined && { graduationYear: dto.graduationYear }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.experience !== undefined && { experience: dto.experience }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.interests !== undefined && { interests: dto.interests }),
        ...(dto.availability !== undefined && { availability: dto.availability }),
        ...(dto.preferredWorkTypes !== undefined && { preferredWorkTypes: dto.preferredWorkTypes }),
      },
    });

    return updatedStudent;
  }
}
