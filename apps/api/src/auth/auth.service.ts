import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

interface JwtPayload {
  sub: string;
  email: string;
  role: "MANAGER" | "STUDENT";
}

type UserWithoutPassword = Omit<User, "passwordHash">;

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    password: string,
    role: "MANAGER" | "STUDENT",
    studentId?: string,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    if (role === "STUDENT" && !studentId) {
      const student = await this.prisma.student.create({
        data: {
          fullName: email.split("@")[0] ?? "Student",
          major: "Undeclared",
          graduationYear: 2027,
          bio: "",
          experience: "",
          skills: [],
          interests: [],
        },
      });
      studentId = student.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(studentId ? { studentId } : {}),
      },
    });

    return this.signAndReturn(user);
  }

  async signin(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.signAndReturn(user as User);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { passwordHash, ...result } = user;
    return result;
  }

  signAndReturn(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  signTokenFromUser(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
