import { Module } from "@nestjs/common";
import { CampusGigsController } from "./campus-gigs.controller.js";
import { AuthModule } from "./auth/auth.module.js";
import { GigsModule } from "./gigs/gigs.module.js";
import { MatchesModule } from "./matches/matches.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { StudentsModule } from "./students/students.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [PrismaModule, AuthModule, StudentsModule, MatchesModule, GigsModule, UsersModule],
  controllers: [CampusGigsController],
})
export class AppModule {}
