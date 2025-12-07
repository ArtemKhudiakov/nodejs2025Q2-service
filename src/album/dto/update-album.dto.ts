import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class UpdateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  year!: number;

  @IsOptional()
  @ValidateIf((o) => o.artistId !== null)
  @IsUUID()
  artistId!: string | null;
}
