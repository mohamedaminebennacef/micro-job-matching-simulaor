import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { CurrentUser } from "./auth/decorators/current-user.decorator.js";
import { Roles } from "./auth/decorators/roles.decorator.js";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "./auth/guards/roles.guard.js";
import { AssignGigDto } from "./dto/assign-gig.dto.js";
import { CreateGigDto } from "./dto/create-gig.dto.js";
import { GigsService } from "./gigs/gigs.service.js";
import { PrismaService } from "./prisma/prisma.service.js";

@ApiTags("CampusGigs")
@Controller()
export class CampusGigsController {
  constructor(
    @Inject(GigsService) private readonly gigsService: GigsService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is running." })
  @ApiResponse({ status: 503, description: "Database unreachable." })
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, service: "campusgigs-api", db: "connected" };
    } catch {
      throw new ServiceUnavailableException({
        ok: false,
        service: "campusgigs-api",
        db: "disconnected",
      });
    }
  }

  @Post("gigs")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a gig and generate ranked candidates" })
  @ApiBody({ type: CreateGigDto })
  @ApiResponse({ status: 201, description: "Gig created with ranked candidates." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Manager role required." })
  createGig(
    @Body() createGigDto: CreateGigDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.gigsService.createGig(createGigDto, user.id);
  }

  @Get("gigs/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a previously created gig" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig record returned." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getGig(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.gigsService.getGig(id);
  }

  @Get("gigs")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List gigs for current user (created or assigned)" })
  @ApiResponse({ status: 200, description: "List of gigs." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  listGigs(@CurrentUser() user: { id: string; role: string }) {
    return this.gigsService.listGigs(user.id, user.role);
  }

  @Post("gigs/:id/assign")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign a gig to a student" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiBody({ type: AssignGigDto })
  @ApiResponse({ status: 200, description: "Gig assigned successfully." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Manager role required." })
  assignGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() assignGigDto: AssignGigDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.gigsService.assignGig(id, assignGigDto, user.id);
  }

  @Post("gigs/:id/accept")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Accept an assigned gig (starts work)" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig accepted and moved to in progress." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Student role required." })
  acceptGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string; studentId: string | null },
  ) {
    return this.gigsService.acceptGig(id, user.studentId ?? "");
  }

  @Post("gigs/:id/decline")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Decline an assigned gig (returns gig to open)" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig declined and returned to open." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Student role required." })
  declineGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string; studentId: string | null },
  ) {
    return this.gigsService.declineGig(id, user.studentId ?? "");
  }

  @Post("gigs/:id/complete")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark an in-progress gig as awaiting confirmation" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig marked as pending completion." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Student role required." })
  completeGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string; studentId: string | null },
  ) {
    return this.gigsService.completeGig(id, user.studentId ?? "");
  }

  @Post("gigs/:id/confirm")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm completion of a gig" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig marked as completed." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Manager role required." })
  confirmGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.gigsService.confirmGigCompletion(id, user.id);
  }
}
