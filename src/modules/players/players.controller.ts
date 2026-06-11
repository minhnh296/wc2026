import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PlayerEntity } from './entities/player.entity';
import { plainToInstance } from 'class-transformer';
import {
  ApiCreatedResponseWrapper,
  ApiOkResponseWrapper,
  ApiErrorResponseWrapper,
} from '@/common/decorators/swagger.decorator';

@ApiTags('Player')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới một cầu thủ' })
  @ApiCreatedResponseWrapper({
    type: PlayerEntity,
    description: 'Tạo cầu thủ thành công.',
  })
  @ApiErrorResponseWrapper(400, 'Lỗi validate dữ liệu đầu vào.')
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    const player = await this.playersService.create(createPlayerDto);
    return plainToInstance(PlayerEntity, player);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách cầu thủ (có phân trang)' })
  @ApiOkResponseWrapper({
    type: PlayerEntity,
    isPage: true,
    description: 'Lấy danh sách thành công.',
  })
  async findAll(@Query() query: PaginationDto) {
    const { data, meta } = await this.prismaFindAll(query);
    return {
      data: plainToInstance(PlayerEntity, data),
      meta,
    };
  }

  private prismaFindAll(query: PaginationDto) {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết cầu thủ theo ID' })
  @ApiOkResponseWrapper({
    type: PlayerEntity,
    description: 'Lấy chi tiết cầu thủ thành công.',
  })
  @ApiErrorResponseWrapper(404, 'Không tìm thấy cầu thủ.')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const player = await this.playersService.findOne(id);
    return plainToInstance(PlayerEntity, player);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin cầu thủ' })
  @ApiOkResponseWrapper({
    type: PlayerEntity,
    description: 'Cập nhật thành công.',
  })
  @ApiErrorResponseWrapper(400, 'Lỗi validate dữ liệu đầu vào.')
  @ApiErrorResponseWrapper(404, 'Không tìm thấy cầu thủ.')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    const player = await this.playersService.update(id, updatePlayerDto);
    return plainToInstance(PlayerEntity, player);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cầu thủ' })
  @ApiOkResponseWrapper({
    type: PlayerEntity,
    description: 'Xóa cầu thủ thành công.',
  })
  @ApiErrorResponseWrapper(404, 'Không tìm thấy cầu thủ.')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const player = await this.playersService.remove(id);
    return plainToInstance(PlayerEntity, player);
  }
}
