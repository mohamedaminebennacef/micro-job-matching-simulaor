import { Module } from "@nestjs/common";
import { MatchScoringService } from "./match-scoring.service.js";
import { MatchesService } from "./matches.service.js";

@Module({
  providers: [MatchesService, MatchScoringService],
  exports: [MatchesService, MatchScoringService],
})
export class MatchesModule {}
