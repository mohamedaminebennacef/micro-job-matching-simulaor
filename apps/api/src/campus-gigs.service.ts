import { Injectable } from "@nestjs/common";
import { AssignGigDto } from "./dto/assign-gig.dto.js";
import { CreateGigDto } from "./dto/create-gig.dto.js";
import { GigsService } from "./gigs/gigs.service.js";

@Injectable()
export class CampusGigsService {
  constructor(private readonly gigsService: GigsService) {}

  createGig(createGigDto: CreateGigDto) {
    return this.gigsService.createGig(createGigDto);
  }

  getGig(id: string) {
    return this.gigsService.getGig(id);
  }

  assignGig(id: string, assignGigDto: AssignGigDto) {
    return this.gigsService.assignGig(id, assignGigDto);
  }
}