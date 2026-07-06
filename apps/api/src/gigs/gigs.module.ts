import { Module } from "@nestjs/common";
import { MatchesModule } from "../matches/matches.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { StudentsModule } from "../students/students.module.js";
import { GigsService } from "./gigs.service.js";

@Module({
  imports: [PrismaModule, StudentsModule, MatchesModule],
  providers: [GigsService],
  exports: [GigsService],
})
export class GigsModule {}
