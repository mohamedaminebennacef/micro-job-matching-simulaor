import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service.js";
import { SignupDto } from "./dto/signup.dto.js";
import { SigninDto } from "./dto/signin.dto.js";
import { LocalAuthGuard } from "./guards/local-auth.guard.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import type { User } from "@prisma/client";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: "User created with access token." })
  @ApiResponse({ status: 409, description: "Email already registered." })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.role, dto.studentId);
  }

  @Post("signin")
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: "Sign in and get access token" })
  @ApiBody({ type: SigninDto })
  @ApiResponse({ status: 200, description: "Access token returned." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  signin(@CurrentUser() user: Omit<User, "passwordHash">) {
    return this.authService.signTokenFromUser(user);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Current user returned." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  me(@CurrentUser() user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
