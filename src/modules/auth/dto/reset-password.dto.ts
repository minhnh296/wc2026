import { ApiProperty } from "@nestjs/swagger";
import { IsShortText, IsPasswordField } from "@/common/decorators/validation.decorator";

export class ResetPasswordDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @IsShortText("Token đặt lại mật khẩu")
  token!: string;

  @ApiProperty({ example: "NewP@ss456!" })
  @IsPasswordField("Mật khẩu mới")
  newPassword!: string;

  @ApiProperty({ example: "NewP@ss456!" })
  @IsShortText("Xác nhận mật khẩu mới")
  confirmPassword!: string;
}
