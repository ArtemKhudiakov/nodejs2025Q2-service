import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Artist[]> {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return artist;
  }

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    return this.prisma.artist.create({
      data: {
        name: createArtistDto.name,
        grammy: createArtistDto.grammy,
      },
    });
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return this.prisma.artist.update({
      where: { id },
      data: {
        name: updateArtistDto.name,
        grammy: updateArtistDto.grammy,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    await this.prisma.artist.delete({
      where: { id },
    });
  }
}

