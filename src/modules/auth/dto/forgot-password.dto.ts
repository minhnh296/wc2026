import { ApiProperty } from "@nestjs/swagger";
import { IsEmailField } from "@/common/decorators/validation.decorator";

export class ForgotPasswordDto {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmailField("Email")
  email!: string;
}
