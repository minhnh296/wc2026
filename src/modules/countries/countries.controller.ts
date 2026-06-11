import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCreatedResponseWrapper, ApiErrorResponseWrapper, ApiOkResponseWrapper } from '@/common/decorators/swagger.decorator';
import { CountryEntity } from './entities/country.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags("Country")
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một quốc gia' })
  @ApiCreatedResponseWrapper({
    type: CountryEntity,
    description: 'Tạo quốc gia thành công.',
  })
  @ApiErrorResponseWrapper(400, 'Lỗi validate dữ liệu đầu vào.')
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách quốc gia (có phân trang)' })
  @ApiOkResponseWrapper({
    type: CountryEntity,
    isPage: true,
    description: 'Lấy danh sách thành công.',
  })
  async findAll(@Query() query: PaginationDto) {
    return this.prismaFindAll(query);
  }

  private prismaFindAll(query: PaginationDto) {
    return this.countriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết quốc gia theo ID' })
  @ApiOkResponseWrapper({
    type: CountryEntity,
    description: 'Lấy chi tiết quốc gia thành công.',
  })
  @ApiErrorResponseWrapper(404, 'Không tìm thấy quốc gia.')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin quốc gia' })
  @ApiOkResponseWrapper({
    type: CountryEntity,
    description: 'Cập nhật thành công.',
  })
  @ApiErrorResponseWrapper(400, 'Lỗi validate dữ liệu đầu vào.')
  @ApiErrorResponseWrapper(404, 'Không tìm thấy quốc gia.')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quốc gia' })
  @ApiOkResponseWrapper({
    type: CountryEntity,
    description: 'Xóa quốc gia thành công.',
  })
  @ApiErrorResponseWrapper(404, 'Không tìm thấy quốc gia.')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.remove(id);
  }
}
