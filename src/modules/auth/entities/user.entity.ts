import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class UserEntity {
  @ApiProperty({ example: "f7a69b76-47b8-4c3e-8e4d-617a26f8d0ab" })
  id!: string;

  @ApiProperty({ example: "nguyenvanany" })
  username!: string;

  @ApiProperty({ example: "nguyenvana@gmail.com" })
  email!: string;

  @ApiProperty({ example: "Nguyễn Văn A" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  createdAt!: Date;

  @Exclude()
  password!: string;

  @Exclude()
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export class LoginResponseEntity {
  @ApiProperty({ type: UserEntity })
  user!: UserEntity;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  accessToken!: string;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  refreshToken!: string;
}
