import { Injectable, UnprocessableEntityException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Favorites, FavoritesResponse } from './entities/favorites.entity';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';

@Injectable()
export class FavoritesService {
  private favorites: Favorites = {
    artists: [],
    albums: [],
    tracks: [],
  };

  constructor(
    @Inject(forwardRef(() => ArtistService))
    private readonly artistService: ArtistService,
    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
  ) { }

  findAll(): FavoritesResponse {
    const artists = this.favorites.artists
      .map((id) => {
        try {
          return this.artistService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((artist) => artist !== null);

    const albums = this.favorites.albums
      .map((id) => {
        try {
          return this.albumService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((album) => album !== null);

    const tracks = this.favorites.tracks
      .map((id) => {
        try {
          return this.trackService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((track) => track !== null);

    return { artists, albums, tracks };
  }

  addArtist(id: string): void {
    // Проверяем существование артиста
    this.artistService.findOne(id);

    if (!this.favorites.artists.includes(id)) {
      this.favorites.artists.push(id);
    }
  }

  removeArtist(id: string): void {
    const index = this.favorites.artists.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Artist is not in favorites');
    }
    this.favorites.artists.splice(index, 1);
  }

  addAlbum(id: string): void {
    // Проверяем существование альбома
    this.albumService.findOne(id);

    if (!this.favorites.albums.includes(id)) {
      this.favorites.albums.push(id);
    }
  }

  removeAlbum(id: string): void {
    const index = this.favorites.albums.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Album is not in favorites');
    }
    this.favorites.albums.splice(index, 1);
  }

  addTrack(id: string): void {
    // Проверяем существование трека
    this.trackService.findOne(id);

    if (!this.favorites.tracks.includes(id)) {
      this.favorites.tracks.push(id);
    }
  }

  removeTrack(id: string): void {
    const index = this.favorites.tracks.indexOf(id);
    if (index === -1) {
      throw new NotFoundException('Track is not in favorites');
    }
    this.favorites.tracks.splice(index, 1);
  }

  // Методы для удаления из избранного при удалении сущности
  removeArtistFromFavorites(id: string): void {
    const index = this.favorites.artists.indexOf(id);
    if (index !== -1) {
      this.favorites.artists.splice(index, 1);
    }
  }

  removeAlbumFromFavorites(id: string): void {
    const index = this.favorites.albums.indexOf(id);
    if (index !== -1) {
      this.favorites.albums.splice(index, 1);
    }
  }

  removeTrackFromFavorites(id: string): void {
    const index = this.favorites.tracks.indexOf(id);
    if (index !== -1) {
      this.favorites.tracks.splice(index, 1);
    }
  }
}

