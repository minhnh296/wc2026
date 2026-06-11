import { ApiProperty } from "@nestjs/swagger";
import { IsEmailField, IsNameText, IsShortText, IsPasswordField } from "@/common/decorators/validation.decorator";
import { IsUnique } from "@/common/decorators/is-unique.decorator";

export class RegisterDto {
  @ApiProperty({ example: "nguyenvanany" })
  @IsShortText("Tên đăng nhập")
  @IsUnique({ model: "User", field: "username", name: "Tên đăng nhập" })
  username!: string;

  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmailField("Email")
  @IsUnique({ model: "User", field: "email", name: "Email" })
  email!: string;

  @ApiProperty({ example: "Nguyễn Văn A" })
  @IsNameText("Họ và tên")
  name!: string;

  @ApiProperty({ example: "password123" })
  @IsPasswordField("Mật khẩu")
  password!: string;
}
