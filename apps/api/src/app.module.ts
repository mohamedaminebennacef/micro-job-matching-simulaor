import { Module } from "@nestjs/common";
import { CampusGigsController } from "./campus-gigs.controller.js";
import { GigsModule } from "./gigs/gigs.module.js";
import { MatchesModule } from "./matches/matches.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { StudentsModule } from "./students/students.module.js";

@Module({
  imports: [PrismaModule, StudentsModule, MatchesModule, GigsModule],
  controllers: [CampusGigsController],
})
export class AppModule {}
