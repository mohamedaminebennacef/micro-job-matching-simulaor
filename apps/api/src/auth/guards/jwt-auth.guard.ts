import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth.service.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid Authorization header");
    }

    const token = authHeader.slice(7);
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(token) as { sub: string; email: string; role: string };
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    request.user = user;
    return true;
  }
}
