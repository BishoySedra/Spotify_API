import { ApiProperty } from '@nestjs/swagger';

export class CopyTracksByDateDto {
  @ApiProperty({
    description: 'The Spotify ID of the target playlist to copy tracks into',
    example: '3cEYpjA9oz9GiPac4AsH4n',
  })
  targetPlaylistId: string;
}
