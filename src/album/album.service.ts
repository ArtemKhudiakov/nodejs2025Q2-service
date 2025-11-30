import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { v4 as randomUUID } from 'uuid';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class AlbumService {
  private albums: Album[] = [];

  constructor(
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) { }

  findAll(): Album[] {
    return this.albums;
  }

  findOne(id: string): Album {
    const album = this.albums.find((a) => a.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  create(createAlbumDto: CreateAlbumDto): Album {
    const newAlbum: Album = {
      id: randomUUID(),
      name: createAlbumDto.name,
      year: createAlbumDto.year,
      artistId: createAlbumDto.artistId || null,
    };

    this.albums.push(newAlbum);
    return newAlbum;
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto): Album {
    const album = this.albums.find((a) => a.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    album.name = updateAlbumDto.name;
    album.year = updateAlbumDto.year;
    album.artistId = updateAlbumDto.artistId || null;

    return album;
  }

  remove(id: string): void {
    const index = this.albums.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException('Album not found');
    }

    // Каскадное удаление: устанавливаем albumId = null в Track
    this.trackService.removeAlbumReference(id);

    // Удаляем из favorites
    this.favoritesService.removeAlbumFromFavorites(id);

    this.albums.splice(index, 1);
  }

  removeArtistReference(artistId: string): void {
    this.albums.forEach((album) => {
      if (album.artistId === artistId) {
        album.artistId = null;
      }
    });
  }
}

