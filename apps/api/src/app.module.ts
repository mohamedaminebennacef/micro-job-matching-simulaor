import { Module } from "@nestjs/common";
import { CampusGigsController } from "./campus-gigs.controller.js";
import { CampusGigsService } from "./campus-gigs.service.js";

@Module({
  controllers: [CampusGigsController],
  providers: [CampusGigsService],
})
export class AppModule {}
