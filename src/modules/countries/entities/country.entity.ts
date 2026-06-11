import { ApiProperty } from "@nestjs/swagger"

export class CountryEntity {
  @ApiProperty({ example: 'VN' })
  code: string

  @ApiProperty({ example: 'Viet Nam' })
  name: string

  @ApiProperty({ example: 'Mô tả', required: false })
  description: string

}
