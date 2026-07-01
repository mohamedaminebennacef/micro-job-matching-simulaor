import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignGigDto {
  @ApiProperty({
    example: "2f5b7f8e-7e4d-4f77-b0a7-85f0b7657c11",
    description: "The student UUID returned in the gig candidates list.",
  })
  @IsUUID()
  studentId!: string;
}
