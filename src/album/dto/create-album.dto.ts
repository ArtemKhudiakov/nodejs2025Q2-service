import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateAlbumDto {
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
