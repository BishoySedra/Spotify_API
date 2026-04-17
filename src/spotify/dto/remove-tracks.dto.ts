import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RemoveTracksDto {
  @ApiProperty({
    description: 'Array of Spotify track URIs to remove',
    example: ['spotify:track:4iV5W9uYEdYUVa79Axb7Rh'],
    type: [String],
  })
  uris: string[];

  @ApiPropertyOptional({
    description:
      "The playlist's snapshot ID to validate against. If omitted, the latest version is used.",
    example: 'MywxMmM4ZTk1...',
  })
  snapshot_id?: string;
}
