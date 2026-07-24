import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Jane Doe" })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: "Computer Science" })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ example: 2027 })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  graduationYear?: number;

  @ApiPropertyOptional({ example: "Passionate about technology." })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: "2 years of web development" })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({ example: ["React", "TypeScript"] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ example: ["hackathons", "AI"] })
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiPropertyOptional({ example: "Weekdays 9am-5pm" })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ example: ["Tech support", "Web development"] })
  @IsOptional()
  @IsArray()
  preferredWorkTypes?: string[];
}
