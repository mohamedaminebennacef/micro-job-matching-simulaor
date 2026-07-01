import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { AssignGigDto } from "./dto/assign-gig.dto.js";
import { CreateGigDto } from "./dto/create-gig.dto.js";
import { CampusGigsService } from "./campus-gigs.service.js";

@Controller()
export class CampusGigsController {
  constructor(private readonly campusGigsService: CampusGigsService) {}

  @Get("health")
  healthCheck() {
    return { ok: true, service: "campusgigs-api" };
  }

  @Post("gigs")
  createGig(@Body() createGigDto: CreateGigDto) {
    return this.campusGigsService.createGig(createGigDto);
  }

  @Get("gigs/:id")
  getGig(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.campusGigsService.getGig(id);
  }

  @Post("gigs/:id/assign")
  @HttpCode(200)
  assignGig(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() assignGigDto: AssignGigDto,
  ) {
    return this.campusGigsService.assignGig(id, assignGigDto);
  }
}
