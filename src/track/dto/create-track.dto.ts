import { IsString, IsNotEmpty, IsInt, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  duration!: number;

  @IsOptional()
  @ValidateIf((o) => o.artistId !== null)
  @IsUUID()
  artistId!: string | null;

  @IsOptional()
  @ValidateIf((o) => o.albumId !== null)
  @IsUUID()
  albumId!: string | null;
}

