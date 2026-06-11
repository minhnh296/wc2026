import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, ValidateIf } from "class-validator";
import { IsShortText, IsEmailField } from "@/common/decorators/validation.decorator";

export class LoginDto {
  @ApiProperty({ example: "nguyenvanany", required: false })
  @ValidateIf(o => !o.email)
  @IsShortText("Tên đăng nhập")
  username?: string;

  @ApiProperty({ example: "nguyenvana@gmail.com", required: false })
  @ValidateIf(o => !o.username)
  @IsEmailField("Email")
  email?: string;

  @ApiProperty({ example: "P@ssword123" })
  @IsShortText("Mật khẩu")
  password!: string;
}
