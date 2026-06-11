import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { TokenService } from "./token.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UserEntity } from "./entities/user.entity";

// Không dùng bcrypt.hash thật để tránh timing khác biệt khi user không tồn tại
const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuvuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

interface ForgotPasswordState {
  lastSentAt: number;
  countInWindow: number;
  windowStartAt: number;
  blockedUntil: number;
}

interface ResetPayload {
  sub: string;
  username: string;
  type: 'reset_password';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly forgotPasswordTracker = new Map<string, ForgotPasswordState>();
  private static readonly RESET_TOKEN_EXPIRY = '15m';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  // ─── REGISTER ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
    });
    return new UserEntity(user);
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.username ? { username: dto.username } : undefined,
          dto.email ? { email: dto.email } : undefined,
        ].filter(Boolean) as any[],
      },
    });

    // Luôn chạy bcrypt để tránh timing attack
    const hashToCompare = user?.password ?? DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(dto.password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng.");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    const payload = { sub: user.id, username: user.username };
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);

    this.logger.log(`User "${user.username}" đăng nhập thành công`);

    return {
      user: new UserEntity(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── SIGN OUT ──────────────────────────────────────────────────────────────

  async signOut(accessToken: string, refreshToken: string): Promise<{ message: string }> {
    this.tokenService.addToBlacklist(accessToken);
    this.tokenService.addToBlacklist(refreshToken);
    return { message: "Đăng xuất thành công." };
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Tài khoản không tồn tại hoặc đã bị khóa.");
    }

    // Rotate: thu hồi refresh token cũ, cấp cặp token mới
    this.tokenService.addToBlacklist(refreshToken);

    const newPayload = { sub: user.id, username: user.username };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenService.signAccessToken(newPayload),
      this.tokenService.signRefreshToken(newPayload),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // ─── VALIDATE USER (dùng trong AuthGuard) ──────────────────────────────────

  async validateUser(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !user.isActive) return null;
    return new UserEntity(user);
  }

  // ─── CHANGE PASSWORD ───────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    if (dto.currentPassword === dto.newPassword) {
      throw new UnprocessableEntityException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
    }
    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnprocessableEntityException("Mật khẩu mới và xác nhận mật khẩu phải khớp.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại.");
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new UnprocessableEntityException("Mật khẩu hiện tại không đúng.");
    }

    const newHashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashed },
    });

    this.logger.log(`User "${user.username}" đổi mật khẩu thành công`);
    return { message: "Đổi mật khẩu thành công." };
  }

  // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    // Luôn trả về cùng message dù email có tồn tại hay không (tránh email enumeration)
    const SAFE_MESSAGE = "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.";

    const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      return { message: SAFE_MESSAGE };
    }

    // Rate limiting: 1 phút/lần, tối đa 5 lần/10 phút, block 3 giờ
    const now = Date.now();
    let state = this.forgotPasswordTracker.get(dto.email);

    if (state) {
      if (now < state.blockedUntil) {
        const remainingHours = Math.ceil((state.blockedUntil - now) / (60 * 60 * 1000));
        throw new ForbiddenException(`Quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingHours} giờ.`);
      }
      if (now - state.lastSentAt < 60_000) {
        throw new ForbiddenException("Vui lòng đợi 1 phút trước khi gửi lại yêu cầu.");
      }
      if (now - state.windowStartAt < 10 * 60_000) {
        state.countInWindow += 1;
        if (state.countInWindow > 5) {
          state.blockedUntil = now + 3 * 60 * 60 * 1000;
          this.forgotPasswordTracker.set(dto.email, state);
          throw new ForbiddenException("Vượt quá 5 lần trong 10 phút. Tài khoản tạm dừng 3 giờ.");
        }
      } else {
        state.windowStartAt = now;
        state.countInWindow = 1;
      }
      state.lastSentAt = now;
    } else {
      state = { lastSentAt: now, countInWindow: 1, windowStartAt: now, blockedUntil: 0 };
    }
    this.forgotPasswordTracker.set(dto.email, state);

    // Tạo reset token (JWT ngắn hạn 15 phút)
    const resetToken = await this.tokenService['jwtService'].signAsync(
      { sub: user.id, username: user.username, type: 'reset_password' } satisfies ResetPayload,
      {
        secret: this.tokenService['config'].jwt.secret,
        expiresIn: AuthService.RESET_TOKEN_EXPIRY,
      },
    );

    // TODO: Tích hợp MailService để gửi email thực tế
    // Tạm thời log reset token ra để test (XÓA khi lên production)
    this.logger.warn(`[DEV ONLY] Reset token for ${user.email}: ${resetToken}`);

    return { message: SAFE_MESSAGE };
  }

  // ─── RESET PASSWORD ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnprocessableEntityException("Mật khẩu mới và xác nhận mật khẩu phải khớp.");
    }

    if (this.tokenService.isBlacklisted(dto.token)) {
      throw new UnauthorizedException("Link đặt lại mật khẩu đã được sử dụng hoặc không hợp lệ.");
    }

    let payload: ResetPayload;
    try {
      payload = await this.tokenService['jwtService'].verifyAsync(dto.token, {
        secret: this.tokenService['config'].jwt.secret,
      });
    } catch {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn.");
    }

    if (payload.type !== 'reset_password') {
      throw new UnauthorizedException("Token không hợp lệ.");
    }

    const newHashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: newHashed },
    });

    // Vô hiệu hóa token sau khi dùng
    this.tokenService.addToBlacklist(dto.token);

    this.logger.log(`User "${payload.username}" đặt lại mật khẩu thành công`);
    return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
  }

  async checkResetToken(token: string): Promise<{ message: string; isValid: boolean }> {
    if (this.tokenService.isBlacklisted(token)) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã được sử dụng.");
    }
    try {
      const payload = await this.tokenService['jwtService'].verifyAsync<ResetPayload>(token, {
        secret: this.tokenService['config'].jwt.secret,
      });
      if (payload.type !== 'reset_password') {
        throw new UnauthorizedException("Token không hợp lệ.");
      }
      return { message: "Token hợp lệ.", isValid: true };
    } catch {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn.");
    }
  }
}
