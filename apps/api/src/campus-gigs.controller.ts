import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AssignGigDto } from "./dto/assign-gig.dto.js";
import { CreateGigDto } from "./dto/create-gig.dto.js";
import { CampusGigsService } from "./campus-gigs.service.js";

@ApiTags("CampusGigs")
@Controller()
export class CampusGigsController {
  constructor(private readonly campusGigsService: CampusGigsService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is running." })
  healthCheck() {
    return { ok: true, service: "campusgigs-api" };
  }

  @Post("gigs")
  @ApiOperation({ summary: "Create a gig and generate ranked candidates" })
  @ApiBody({ type: CreateGigDto })
  @ApiResponse({ status: 201, description: "Gig created with ranked candidates." })
  createGig(@Body() createGigDto: CreateGigDto) {
    return this.campusGigsService.createGig(createGigDto);
  }

  @Get("gigs/:id")
  @ApiOperation({ summary: "Get a previously created gig" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiResponse({ status: 200, description: "Gig record returned." })
  getGig(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.campusGigsService.getGig(id);
  }

  @Post("gigs/:id/assign")
  @HttpCode(200)
  @ApiOperation({ summary: "Assign a gig to a student" })
  @ApiParam({ name: "id", description: "Gig UUID" })
  @ApiBody({ type: AssignGigDto })
  @ApiResponse({ status: 200, description: "Gig assigned successfully." })
  assignGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() assignGigDto: AssignGigDto,
  ) {
    return this.campusGigsService.assignGig(id, assignGigDto);
  }
}
