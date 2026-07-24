import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({ example: "john@university.edu" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: "MANAGER", enum: ["MANAGER", "STUDENT"] })
  @IsString()
  role!: "MANAGER" | "STUDENT";

  @ApiProperty({ example: "optional-student-uuid", required: false })
  @IsOptional()
  @IsString()
  studentId?: string;
}
