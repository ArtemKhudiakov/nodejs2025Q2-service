import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Track[]> {
    return this.prisma.track.findMany();
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    return this.prisma.track.create({
      data: {
        name: createTrackDto.name,
        duration: createTrackDto.duration,
        artistId: createTrackDto.artistId || null,
        albumId: createTrackDto.albumId || null,
      },
    });
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return this.prisma.track.update({
      where: { id },
      data: {
        name: updateTrackDto.name,
        duration: updateTrackDto.duration,
        artistId: updateTrackDto.artistId || null,
        albumId: updateTrackDto.albumId || null,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    await this.prisma.track.delete({
      where: { id },
    });
  }
}

