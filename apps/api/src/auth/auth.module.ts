import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { LocalAuthGuard } from "./guards/local-auth.guard.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";

const jwtSecret = process.env.JWT_SECRET ?? "dev-jwt-secret-change-me";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalAuthGuard, JwtAuthGuard],
  exports: [AuthService, LocalAuthGuard, JwtAuthGuard],
})
export class AuthModule {}
