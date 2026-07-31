import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { MatchesModule } from "../matches/matches.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { StudentsModule } from "../students/students.module.js";
import { GigsService } from "./gigs.service.js";

@Module({
  imports: [PrismaModule, StudentsModule, MatchesModule, AiModule, NotificationsModule],
  providers: [GigsService],
  exports: [GigsService],
})
export class GigsModule {}
