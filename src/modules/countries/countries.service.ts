import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { getPagination } from '@/common/utils/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCountryDto: CreateCountryDto) {
    return this.prisma.country.create({
      data: createCountryDto,
    });
  }

  async findAll(query: PaginationDto) {
    const { skip, take, page, pageSize } = getPagination(query);

    const [data, total] = await Promise.all([
      this.prisma.country.findMany({
        skip,
        take,
      }),
      this.prisma.country.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number) {
    const country = await this.prisma.country.findUnique({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(`Không tìm thấy quốc gia với ID ${id}`);
    }

    return country;
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    await this.findOne(id);

    return this.prisma.country.update({
      where: { id },
      data: updateCountryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.country.delete({
      where: { id },
    });
  }
}