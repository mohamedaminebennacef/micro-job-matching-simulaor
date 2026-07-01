import { IsUUID } from "class-validator";

export class AssignGigDto {
  @IsUUID()
  studentId!: string;
}
