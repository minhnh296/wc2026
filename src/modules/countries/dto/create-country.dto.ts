import { IsUnique } from "@/common/decorators/is-unique.decorator"
import { IsCodeText, IsLongText, IsNameText } from "@/common/decorators/validation.decorator"
import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"

export class CreateCountryDto {
  @IsUnique({ model: 'Country', field: 'code', name: "Mã quốc gia" })
  @ApiProperty({ example: 'VN' })
  @IsCodeText('Mã')
  @IsNotEmpty({ message: 'Mã không được để trống.' })
  code: string

  @ApiProperty({ example: 'Viet Nam' })
  @IsNameText('Tên')
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Mô tả', required: false })
  @IsLongText("Mô tả")
  @IsOptional()
  description: string
}