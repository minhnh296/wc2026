import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { PaginationDto } from '@/shared/pagination/pagination.dto';
import { getPagination } from '@/shared/pagination/pagination.utils';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPlayerDto: CreatePlayerDto) {
    return this.prisma.player.create({
      data: createPlayerDto,
      include: {
        position: true,
        country: true,
      },
    });
  }

  async findAll(query: PaginationDto) {
    const { skip, take, page, pageSize } = getPagination(query);

    const [data, total] = await Promise.all([
      this.prisma.player.findMany({
        skip,
        take,
        include: {
          position: true,
          country: true,
        },
      }),
      this.prisma.player.count(),
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
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        position: true,
        country: true,
      },
    });

    if (!player) {
      throw new NotFoundException(`Không tìm thấy cầu thủ với ID ${id}`);
    }

    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    await this.findOne(id);

    return this.prisma.player.update({
      where: { id },
      data: updatePlayerDto,
      include: {
        position: true,
        country: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.player.delete({
      where: { id },
    });
  }
}
