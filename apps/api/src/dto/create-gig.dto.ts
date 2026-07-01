import { IsNumber, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGigDto {
  @ApiProperty({ example: "Need help moving lab equipment" })
  @IsString()
  title!: string;

  @ApiProperty({ example: "Move boxed equipment from the lab to storage." })
  @IsString()
  description!: string;

  @ApiProperty({ example: "Science Hall, Room 204" })
  @IsString()
  location!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  durationHours!: number;

  @ApiProperty({ example: 18, minimum: 0 })
  @IsNumber()
  @Min(0)
  hourlyRate!: number;
}
