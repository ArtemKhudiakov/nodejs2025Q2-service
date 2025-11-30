import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { v4 as randomUUID } from 'uuid';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class TrackService {
  private tracks: Track[] = [];

  constructor(
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) { }

  findAll(): Track[] {
    return this.tracks;
  }

  findOne(id: string): Track {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  create(createTrackDto: CreateTrackDto): Track {
    const newTrack: Track = {
      id: randomUUID(),
      name: createTrackDto.name,
      duration: createTrackDto.duration,
      artistId: createTrackDto.artistId || null,
      albumId: createTrackDto.albumId || null,
    };

    this.tracks.push(newTrack);
    return newTrack;
  }

  update(id: string, updateTrackDto: UpdateTrackDto): Track {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    track.name = updateTrackDto.name;
    track.duration = updateTrackDto.duration;
    track.artistId = updateTrackDto.artistId || null;
    track.albumId = updateTrackDto.albumId || null;

    return track;
  }

  remove(id: string): void {
    const index = this.tracks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException('Track not found');
    }

    // Удаляем из favorites
    this.favoritesService.removeTrackFromFavorites(id);

    this.tracks.splice(index, 1);
  }

  removeArtistReference(artistId: string): void {
    this.tracks.forEach((track) => {
      if (track.artistId === artistId) {
        track.artistId = null;
      }
    });
  }

  removeAlbumReference(albumId: string): void {
    this.tracks.forEach((track) => {
      if (track.albumId === albumId) {
        track.albumId = null;
      }
    });
  }
}

