import {
  IsNameText,
  IsShortText,
  Required,
  IsNumberField,
  IsDateField,
  IsCodeText,
} from '@/common/decorators/validation.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsExist } from '@/common/decorators/is-exist.decorator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNameText('Tên')
  name: string;

  @ApiProperty({ example: '1999-01-01' })
  @Required('Ngày sinh')
  @IsDateField('Ngày sinh')
  dob: string;

  @ApiProperty({ example: 10 })
  @Required('Số áo')
  @IsNumberField('Số áo')
  number: number;

  @ApiProperty({ example: 70.5 })
  @Required('Cân nặng')
  @IsNumberField('Cân nặng')
  weight: number;

  @ApiProperty({ example: 175 })
  @Required('Chiều cao')
  @IsNumberField('Chiều cao')
  height: number;

  @ApiProperty({ example: 'Hà Nội FC' })
  @IsShortText('Câu lạc bộ')
  club: string;

  @ApiPropertyOptional({ example: 'CF' })
  @IsOptional()
  @IsExist({ model: 'Position', field: 'code', name: 'Vị trí thi đấu' })
  @IsCodeText('Mã vị trí', 10, { required: false })
  positionCode: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsExist({ model: 'Country', field: 'id', name: 'Quốc gia' })
  @IsNumberField('ID quốc gia')
  countryId: number;
}
