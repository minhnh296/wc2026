import { Controller, Post, Body, Get, Patch, UseGuards, Headers, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { UserEntity, LoginResponseEntity } from "./entities/user.entity";
import { plainToInstance } from "class-transformer";
import { AuthGuard } from "@/common/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import {
  ApiCreatedResponseWrapper,
  ApiOkResponseWrapper,
  ApiErrorResponseWrapper,
} from "@/common/decorators/swagger.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Đăng ký tài khoản mới" })
  @ApiCreatedResponseWrapper({ type: UserEntity, description: "Đăng ký thành công." })
  @ApiErrorResponseWrapper(400, "Lỗi validate dữ liệu hoặc trùng lặp.")
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return plainToInstance(UserEntity, user);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng nhập và nhận Access Token + Refresh Token" })
  @ApiOkResponseWrapper({ type: LoginResponseEntity, description: "Đăng nhập thành công." })
  @ApiErrorResponseWrapper(401, "Thông tin đăng nhập không chính xác.")
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      user: plainToInstance(UserEntity, result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Đăng xuất và thu hồi token" })
  @ApiOkResponseWrapper({ type: UserEntity, description: "Đăng xuất thành công." })
  @ApiErrorResponseWrapper(401, "Chưa xác thực.")
  async logout(
    @Headers("authorization") authHeader: string,
    @Body() dto: RefreshTokenDto,
  ) {
    const accessToken = authHeader?.replace("Bearer ", "") ?? "";
    return this.authService.signOut(accessToken, dto.refreshToken);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Làm mới Access Token bằng Refresh Token" })
  @ApiOkResponseWrapper({ type: LoginResponseEntity, description: "Cấp token mới thành công." })
  @ApiErrorResponseWrapper(401, "Refresh token không hợp lệ hoặc đã hết hạn.")
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get(["me", "profile"])
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Lấy thông tin tài khoản hiện tại" })
  @ApiOkResponseWrapper({ type: UserEntity, description: "Lấy thông tin thành công." })
  @ApiErrorResponseWrapper(401, "Chưa xác thực hoặc token không hợp lệ.")
  getMe(@CurrentUser() user: UserEntity) {
    return plainToInstance(UserEntity, user);
  }

  @Patch("change-password")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Đổi mật khẩu" })
  @ApiOkResponseWrapper({ type: UserEntity, description: "Đổi mật khẩu thành công." })
  @ApiErrorResponseWrapper(422, "Mật khẩu hiện tại không đúng hoặc mật khẩu mới không hợp lệ.")
  changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Yêu cầu đặt lại mật khẩu qua email" })
  @ApiOkResponseWrapper({ type: UserEntity, description: "Gửi yêu cầu thành công." })
  @ApiErrorResponseWrapper(429, "Quá nhiều yêu cầu.")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đặt lại mật khẩu bằng token" })
  @ApiOkResponseWrapper({ type: UserEntity, description: "Đặt lại mật khẩu thành công." })
  @ApiErrorResponseWrapper(401, "Token không hợp lệ hoặc đã hết hạn.")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get("check-reset-token")
  @ApiOperation({ summary: "Kiểm tra thời hạn của token reset password" })
  @ApiOkResponseWrapper({ type: Object, description: "Token hợp lệ." })
  @ApiErrorResponseWrapper(401, "Token không hợp lệ hoặc đã hết hạn.")
  async checkResetToken(@Query("token") token: string) {
    return this.authService.checkResetToken(token);
  }
}
