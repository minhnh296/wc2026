import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TransformRelationName } from '@/common/decorators/transform.decorator';

export class PlayerEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: '1999-01-01' })
  dob: string;

  @ApiProperty({ example: 10 })
  number: number;

  @ApiProperty({ example: 70.5 })
  weight: number;

  @ApiProperty({ example: 175 })
  height: number;

  @ApiProperty({ example: 'Hà Nội FC' })
  club: string;

  @Exclude()
  positionCode: string;

  @Exclude()
  countryId: number;

  @Exclude()
  position?: Record<string, unknown>;

  @Exclude()
  country?: Record<string, unknown>;

  @ApiProperty({ example: 'Tiền vệ' })
  @Expose()
  @TransformRelationName('position')
  positionName: string;

  @ApiProperty({ example: 'Lào' })
  @Expose()
  @TransformRelationName('country')
  countryName: string;

  constructor(partial: Partial<PlayerEntity>) {
    Object.assign(this, partial);
  }
}
