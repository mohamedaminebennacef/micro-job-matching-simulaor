import { IsNumber, IsString, Min } from "class-validator";

export class CreateGigDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(1)
  durationHours!: number;

  @IsNumber()
  @Min(0)
  hourlyRate!: number;
}
