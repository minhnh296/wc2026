import { ApiProperty } from "@nestjs/swagger";
import { IsShortText } from "@/common/decorators/validation.decorator";

export class RefreshTokenDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @IsShortText("Refresh token")
  refreshToken!: string;
}
