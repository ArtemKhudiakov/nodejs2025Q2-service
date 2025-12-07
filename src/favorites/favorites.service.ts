import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FavoritesResponse } from './entities/favorites.entity';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';

const DEFAULT_USER_ID = 'default';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly artistService: ArtistService,
    private readonly albumService: AlbumService,
    private readonly trackService: TrackService,
  ) {}

  async findAll(): Promise<FavoritesResponse> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: DEFAULT_USER_ID },
    });

    const artistIds = favorites
      .filter((f) => f.artistId !== null)
      .map((f) => f.artistId!);
    const albumIds = favorites
      .filter((f) => f.albumId !== null)
      .map((f) => f.albumId!);
    const trackIds = favorites
      .filter((f) => f.trackId !== null)
      .map((f) => f.trackId!);

    const artists = await Promise.all(
      artistIds.map(async (id) => {
        try {
          return await this.artistService.findOne(id);
        } catch {
          return null;
        }
      }),
    );

    const albums = await Promise.all(
      albumIds.map(async (id) => {
        try {
          return await this.albumService.findOne(id);
        } catch {
          return null;
        }
      }),
    );

    const tracks = await Promise.all(
      trackIds.map(async (id) => {
        try {
          return await this.trackService.findOne(id);
        } catch {
          return null;
        }
      }),
    );

    return {
      artists: artists.filter((artist) => artist !== null),
      albums: albums.filter((album) => album !== null),
      tracks: tracks.filter((track) => track !== null),
    };
  }

  async addArtist(id: string): Promise<void> {
    await this.artistService.findOne(id);

    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        artistId: id,
      },
    });

    if (!existing) {
      await this.prisma.favorite.create({
        data: {
          userId: DEFAULT_USER_ID,
          artistId: id,
        },
      });
    }
  }

  async removeArtist(id: string): Promise<void> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        artistId: id,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Artist is not in favorites');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async addAlbum(id: string): Promise<void> {
    await this.albumService.findOne(id);

    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        albumId: id,
      },
    });

    if (!existing) {
      await this.prisma.favorite.create({
        data: {
          userId: DEFAULT_USER_ID,
          albumId: id,
        },
      });
    }
  }

  async removeAlbum(id: string): Promise<void> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        albumId: id,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Album is not in favorites');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async addTrack(id: string): Promise<void> {
    await this.trackService.findOne(id);

    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        trackId: id,
      },
    });

    if (!existing) {
      await this.prisma.favorite.create({
        data: {
          userId: DEFAULT_USER_ID,
          trackId: id,
        },
      });
    }
  }

  async removeTrack(id: string): Promise<void> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        trackId: id,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Track is not in favorites');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }
}
