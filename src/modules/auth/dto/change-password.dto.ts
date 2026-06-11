import { ApiProperty } from "@nestjs/swagger";
import { IsShortText, IsPasswordField } from "@/common/decorators/validation.decorator";

export class ChangePasswordDto {
  @ApiProperty({ example: "OldP@ss123" })
  @IsShortText("Mật khẩu hiện tại")
  currentPassword!: string;

  @ApiProperty({ example: "NewP@ss456!" })
  @IsPasswordField("Mật khẩu mới")
  newPassword!: string;

  @ApiProperty({ example: "NewP@ss456!" })
  @IsShortText("Xác nhận mật khẩu mới")
  confirmPassword!: string;
}
